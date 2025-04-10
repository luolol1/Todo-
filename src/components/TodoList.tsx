import React, { useState } from 'react';
import { List, Checkbox, Button, Input, Modal, Tag, Tooltip, Space, Badge, DatePicker, Dropdown, Menu, Select } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ClockCircleOutlined, 
  BellOutlined, 
  CloudOutlined, 
  CloudSyncOutlined, 
  CloudDownloadOutlined, 
  WarningOutlined, 
  TagOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface Category {
  id: string;
  name: string;
  color: string;
}

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

interface TodoListProps {
  todos: Todo[];
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, updates: Partial<Todo>) => void;
  categories: Category[];
  tags: TodoTag[];
}

const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  toggleTodo, 
  deleteTodo, 
  editTodo,
  categories,
  tags
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editDueDate, setEditDueDate] = useState<dayjs.Dayjs | null>(null);
  const [editReminder, setEditReminder] = useState<dayjs.Dayjs | null>(null);

  // 获取分类名称和颜色
  const getCategoryInfo = (categoryId?: string) => {
    if (!categoryId) return { name: '默认', color: '#1890ff' };
    const category = categories.find(c => c.id === categoryId);
    return category || { name: '默认', color: '#1890ff' };
  };

  // 获取标签信息
  const getTagInfo = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    return tag || { id: tagId, name: tagId, color: '#d9d9d9' };
  };

  // 启动编辑
  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditCategory(todo.categoryId || 'default');
    setEditTags(todo.tags || []);
    setEditDueDate(todo.dueDate ? dayjs(todo.dueDate) : null);
    setEditReminder(todo.reminder ? dayjs(todo.reminder) : null);
  };

  // 提交编辑
  const handleEdit = () => {
    if (editingId !== null && editText.trim()) {
      const updates: Partial<Todo> = {
        text: editText,
        categoryId: editCategory,
        tags: editTags,
        dueDate: editDueDate ? editDueDate.valueOf() : undefined,
        reminder: editReminder ? editReminder.valueOf() : undefined
      };
      
      editTodo(editingId, updates);
      setEditingId(null);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
  };

  // 编辑对话框
  const editModal = (
    <Modal
      title="编辑任务"
      open={editingId !== null}
      onOk={handleEdit}
      onCancel={cancelEdit}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="任务内容"
          autoFocus
        />
        
        <Select
          style={{ width: '100%' }}
          value={editCategory}
          onChange={setEditCategory}
          placeholder="选择分类"
        >
          {categories.map(category => (
            <Select.Option key={category.id} value={category.id}>
              <Tag color={category.color}>{category.name}</Tag>
            </Select.Option>
          ))}
        </Select>
        
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="选择标签"
          value={editTags}
          onChange={setEditTags}
        >
          {tags.map(tag => (
            <Select.Option key={tag.id} value={tag.id}>
              <Tag color={tag.color}>{tag.name}</Tag>
            </Select.Option>
          ))}
        </Select>
        
        <DatePicker
          style={{ width: '100%' }}
          value={editDueDate}
          onChange={setEditDueDate}
          format="YYYY-MM-DD"
          placeholder="截止日期"
          allowClear
        />
        
        <DatePicker
          style={{ width: '100%' }}
          value={editReminder}
          onChange={setEditReminder}
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          placeholder="提醒时间"
          allowClear
        />
      </Space>
    </Modal>
  );

  // 根据完成状态和创建时间排序任务
  const sortedTodos = [...todos].sort((a, b) => {
    // 优先级：截止日期 > 完成状态 > 创建时间
    
    // 1. 如果都有截止日期，按截止日期排序
    if (a.dueDate && b.dueDate) {
      return a.dueDate - b.dueDate;
    }
    
    // 2. 有截止日期的放前面
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // 3. 按完成状态排序
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // 未完成的任务在前
    }
    
    // 4. 相同状态下，新创建的在前
    return b.createdAt - a.createdAt;
  });

  // 获取同步状态图标
  const getSyncStatusIcon = (status?: 'synced' | 'pending' | 'failed') => {
    switch (status) {
      case 'synced':
        return <CloudDownloadOutlined style={{ color: '#52c41a' }} />;
      case 'pending':
        return <CloudSyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'failed':
        return <WarningOutlined style={{ color: '#f5222d' }} />;
      default:
        return <CloudOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  // 格式化日期显示
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    const date = dayjs(timestamp);
    const today = dayjs().startOf('day');
    const tomorrow = dayjs().add(1, 'day').startOf('day');
    
    if (date.isBefore(today)) {
      return <Tag color="red">{date.format('MM-DD')} 已过期</Tag>;
    } else if (date.isSame(today, 'day')) {
      return <Tag color="orange">今天</Tag>;
    } else if (date.isSame(tomorrow, 'day')) {
      return <Tag color="gold">明天</Tag>;
    } else if (date.isBefore(today.add(7, 'day'))) {
      return <Tag color="blue">{date.format('ddd')}</Tag>;
    } else {
      return <Tag color="cyan">{date.format('MM-DD')}</Tag>;
    }
  };

  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={sortedTodos}
        locale={{ emptyText: '暂无任务' }}
        size="small"
        renderItem={(todo) => {
          const categoryInfo = getCategoryInfo(todo.categoryId);
          const isDueSoon = todo.dueDate && dayjs(todo.dueDate).isBefore(dayjs().add(1, 'day')) && !todo.completed;
          const isOverdue = todo.dueDate && dayjs(todo.dueDate).isBefore(dayjs()) && !todo.completed;
          
          // 额外的操作按钮
          const actions = [
            <Tooltip title="编辑">
              <Button 
                icon={<EditOutlined />} 
                onClick={() => startEditing(todo)}
                type="text"
                size="small"
                style={{ color: 'rgba(0,0,0,0.45)' }}
              />
            </Tooltip>,
            <Tooltip title="删除">
              <Button 
                icon={<DeleteOutlined />} 
                onClick={() => deleteTodo(todo.id)}
                type="text"
                size="small"
                style={{ color: todo.completed ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.45)' }}
              />
            </Tooltip>
          ];
          
          return (
            <List.Item
              actions={actions}
              style={{
                background: todo.completed 
                  ? 'rgba(246, 255, 237, 0.6)' 
                  : isOverdue 
                    ? 'rgba(255, 241, 240, 0.8)'
                    : isDueSoon
                      ? 'rgba(255, 251, 230, 0.8)'
                      : 'rgba(255, 255, 255, 0.6)',
                borderRadius: '8px',
                marginBottom: '8px',
                padding: '8px 16px',
                transition: 'all 0.3s',
                opacity: todo.completed ? 0.8 : 1,
                borderLeft: `3px solid ${categoryInfo.color}`
              }}
            >
              <List.Item.Meta
                avatar={
                  <Space>
                    <Checkbox 
                      checked={todo.completed} 
                      onChange={() => toggleTodo(todo.id)}
                      style={{ marginRight: 8 }}
                    />
                    {todo.syncStatus && (
                      <Tooltip title={`同步状态: ${
                        todo.syncStatus === 'synced' ? '已同步' : 
                        todo.syncStatus === 'pending' ? '正在同步' : '同步失败'
                      }`}>
                        {getSyncStatusIcon(todo.syncStatus)}
                      </Tooltip>
                    )}
                  </Space>
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.85)',
                      marginRight: '8px',
                      fontWeight: isDueSoon ? 600 : 400
                    }}>
                      {todo.text}
                    </span>
                    
                    <Tag color={categoryInfo.color}>{categoryInfo.name}</Tag>
                    
                    {todo.dueDate && formatDate(todo.dueDate)}
                    
                    {todo.reminder && (
                      <Tooltip title={`提醒: ${dayjs(todo.reminder).format('MM-DD HH:mm')}`}>
                        <BellOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    )}
                  </div>
                }
                description={
                  todo.tags && todo.tags.length > 0 ? (
                    <Space size={[0, 4]} wrap>
                      {todo.tags.map(tagId => {
                        const tagInfo = getTagInfo(tagId);
                        return (
                          <Tag 
                            color={tagInfo.color} 
                            key={tagId}
                            style={{ margin: '2px' }}
                          >
                            {tagInfo.name}
                          </Tag>
                        );
                      })}
                    </Space>
                  ) : null
                }
              />
            </List.Item>
          );
        }}
      />
      
      {editModal}
    </>
  );
};

export default TodoList; 