import React, { useState, useEffect } from 'react';
import { Layout, Typography, Statistic, Row, Col, Card, message, Tag, Select, notification } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloudSyncOutlined } from '@ant-design/icons';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import './styles/App.css';
import CategoryManager from './components/CategoryManager';
import firebase from './firebase';

// 尝试加载Electron
const electron = window.require ? window.require('electron') : null;
const { ipcRenderer } = electron || {};

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Option } = Select;

// 任务类别接口
interface Category {
  id: string;
  name: string;
  color: string;
}

// 任务标签接口
interface TodoTag {
  id: string;
  name: string;
  color: string;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
  categoryId?: string;
  tags?: string[];
  dueDate?: number;
  reminder?: number;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      return JSON.parse(savedTodos);
    } else {
      return [];
    }
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      return JSON.parse(savedCategories);
    } else {
      return [
        { id: 'default', name: '默认', color: '#1890ff' },
        { id: 'work', name: '工作', color: '#52c41a' },
        { id: 'study', name: '学习', color: '#722ed1' },
        { id: 'personal', name: '个人', color: '#fa8c16' }
      ];
    }
  });
  
  const [tags, setTags] = useState<TodoTag[]>(() => {
    const savedTags = localStorage.getItem('tags');
    if (savedTags) {
      return JSON.parse(savedTags);
    } else {
      return [
        { id: 'urgent', name: '紧急', color: '#f5222d' },
        { id: 'important', name: '重要', color: '#fa8c16' },
        { id: 'optional', name: '可选', color: '#13c2c2' }
      ];
    }
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [syncInProgress, setSyncInProgress] = useState(false);

  // 保存所有数据到本地存储
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);
  
  // 检查任务提醒
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      todos.forEach(todo => {
        if (!todo.completed && todo.reminder && todo.reminder <= now) {
          // 发送提醒通知
          notification.info({
            message: '任务提醒',
            description: todo.text,
            placement: 'topRight',
          });
          
          // 更新任务，清除已触发的提醒
          const updatedTodos = todos.map(t => 
            t.id === todo.id ? { ...t, reminder: undefined } : t
          );
          setTodos(updatedTodos);
        }
      });
    }, 60000); // 每分钟检查一次
    
    return () => clearInterval(interval);
  }, [todos]);

  // 添加任务
  const addTodo = (text: string, categoryId?: string, tagIds?: string[], dueDate?: number, reminder?: number) => {
    if (text.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text,
        completed: false,
        createdAt: Date.now(),
        categoryId: categoryId || 'default',
        tags: tagIds || [],
        dueDate,
        reminder,
        syncStatus: 'pending'
      };
      
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      
      // 同步到云端
      syncToCloud(newTodo);
    }
  };

  // 切换任务完成状态
  const toggleTodo = (id: number) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        const updatedTodo = { 
          ...todo, 
          completed: !todo.completed,
          syncStatus: 'pending' as const
        };
        
        // 同步到云端
        syncToCloud(updatedTodo);
        
        return updatedTodo;
      }
      return todo;
    });
    
    setTodos(updatedTodos);
  };

  // 删除任务
  const deleteTodo = (id: number) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (todoToDelete) {
      // 删除云端数据
      deleteFromCloud(todoToDelete);
    }
    
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // 编辑任务
  const editTodo = (id: number, updates: Partial<Todo>) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        const updatedTodo = { 
          ...todo, 
          ...updates,
          syncStatus: 'pending' as const
        };
        
        // 同步到云端
        syncToCloud(updatedTodo);
        
        return updatedTodo;
      }
      return todo;
    });
    
    setTodos(updatedTodos);
  };
  
  // 添加新分类
  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name,
      color
    };
    
    setCategories([...categories, newCategory]);
  };
  
  // 添加新标签
  const addTag = (name: string, color: string) => {
    const newTag: TodoTag = {
      id: `tag-${Date.now()}`,
      name,
      color
    };
    
    setTags([...tags, newTag]);
  };
  
  // 同步到云端
  const syncToCloud = async (todo: Todo) => {
    // 这里是与Firebase或其他云存储服务集成的代码
    // 仅为演示，实际实现需要根据所选的云服务进行调整
    try {
      // 假设的云同步代码
      // await firebase.database().ref(`todos/${todo.id}`).set(todo);
      
      // 更新同步状态
      setTodos(prev => 
        prev.map(t => 
          t.id === todo.id ? { ...t, syncStatus: 'synced' } : t
        )
      );
    } catch (error) {
      console.error("同步失败:", error);
      setTodos(prev => 
        prev.map(t => 
          t.id === todo.id ? { ...t, syncStatus: 'failed' } : t
        )
      );
      message.error("云同步失败，请稍后重试");
    }
  };
  
  // 从云端删除
  const deleteFromCloud = async (todo: Todo) => {
    // 云删除代码
    // 例如: await firebase.database().ref(`todos/${todo.id}`).remove();
  };
  
  // 手动触发全量同步
  const syncAllToCloud = async () => {
    setSyncInProgress(true);
    try {
      // 模拟同步
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 更新所有任务的同步状态
      setTodos(prev => prev.map(t => ({ ...t, syncStatus: 'synced' })));
      message.success("所有任务已同步到云端");
    } catch (error) {
      message.error("云同步失败，请稍后重试");
    } finally {
      setSyncInProgress(false);
    }
  };

  // 窗口控制函数
  const handleClose = () => {
    if (ipcRenderer) {
      ipcRenderer.send('close-app');
    } else {
      window.close();
    }
  };

  const handleMinimize = () => {
    if (ipcRenderer) {
      ipcRenderer.send('minimize-app');
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const pendingCount = todos.filter(todo => !todo.completed).length;
  
  // 根据选择的分类筛选任务
  const filteredTodos = selectedCategory === 'all' 
    ? todos 
    : todos.filter(todo => todo.categoryId === selectedCategory);

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="header-controls">
          <div className="header-button minimize-button" onClick={handleMinimize} title="最小化"></div>
          <div className="header-button close-button" onClick={handleClose} title="关闭"></div>
        </div>
      </Header>
      <Content className="content">
        <div className="container">
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="已完成"
                  value={completedCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="待完成"
                  value={pendingCount}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" onClick={syncAllToCloud} style={{ cursor: 'pointer' }}>
                <Statistic
                  title="云同步"
                  value={syncInProgress ? "同步中..." : "点击同步"}
                  prefix={<CloudSyncOutlined spin={syncInProgress} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Select 
                style={{ width: '100%' }} 
                placeholder="选择分类"
                defaultValue="all"
                onChange={(value) => setSelectedCategory(value as string)}
              >
                <Option value="all">全部任务</Option>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    <Tag color={category.color}>{category.name}</Tag>
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          
          <TodoForm 
            addTodo={addTodo} 
            categories={categories}
            tags={tags}
          />
          <TodoList
            todos={filteredTodos}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
            editTodo={editTodo}
            categories={categories}
            tags={tags}
          />
          
          <CategoryManager 
            categories={categories} 
            tags={tags}
            addCategory={addCategory}
            addTag={addTag}
            setCategories={setCategories}
            setTags={setTags}
          />
        </div>
      </Content>
      <Footer className="footer">
        学习任务挂件
      </Footer>
    </Layout>
  );
};

export default App; 