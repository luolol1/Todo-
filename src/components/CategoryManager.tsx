import React, { useState } from 'react';
import { Collapse, Button, List, Input, ColorPicker, Divider, Modal, Tag, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined, AppstoreOutlined } from '@ant-design/icons';
import type { Color } from 'antd/es/color-picker';

const { Panel } = Collapse;
const { Title } = Typography;

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

interface CategoryManagerProps {
  categories: Category[];
  tags: TodoTag[];
  addCategory: (name: string, color: string) => void;
  addTag: (name: string, color: string) => void;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setTags: React.Dispatch<React.SetStateAction<TodoTag[]>>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  tags,
  addCategory,
  addTag,
  setCategories,
  setTags
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'tag'>('category');
  const [newItemName, setNewItemName] = useState('');
  const [newItemColor, setNewItemColor] = useState<string>('#1890ff');
  const [editingItem, setEditingItem] = useState<Category | TodoTag | null>(null);

  // 打开添加新项目的模态框
  const openAddModal = (type: 'category' | 'tag') => {
    setModalType(type);
    setNewItemName('');
    setNewItemColor('#1890ff');
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // 打开编辑模态框
  const openEditModal = (type: 'category' | 'tag', item: Category | TodoTag) => {
    setModalType(type);
    setNewItemName(item.name);
    setNewItemColor(item.color);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 处理添加或编辑
  const handleAddOrEdit = () => {
    if (!newItemName.trim()) {
      return;
    }

    if (editingItem) {
      // 编辑现有项目
      if (modalType === 'category') {
        setCategories(prev => 
          prev.map(c => 
            c.id === editingItem.id 
              ? { ...c, name: newItemName, color: newItemColor } 
              : c
          )
        );
      } else {
        setTags(prev => 
          prev.map(t => 
            t.id === editingItem.id 
              ? { ...t, name: newItemName, color: newItemColor } 
              : t
          )
        );
      }
    } else {
      // 添加新项目
      if (modalType === 'category') {
        addCategory(newItemName, newItemColor);
      } else {
        addTag(newItemName, newItemColor);
      }
    }

    closeModal();
  };

  // 删除项目
  const handleDelete = (type: 'category' | 'tag', id: string) => {
    if (type === 'category') {
      // 删除分类时，将使用该分类的任务重置为默认分类
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      setTags(prev => prev.filter(t => t.id !== id));
    }
  };

  // 渲染模态框内容
  const renderModalContent = () => {
    const title = editingItem 
      ? `编辑${modalType === 'category' ? '分类' : '标签'}` 
      : `添加${modalType === 'category' ? '分类' : '标签'}`;

    return (
      <Modal
        title={title}
        open={isModalOpen}
        onOk={handleAddOrEdit}
        onCancel={closeModal}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder={`${modalType === 'category' ? '分类' : '标签'}名称`}
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            style={{ marginBottom: 16 }}
            autoFocus
          />
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 8 }}>颜色：</span>
            <ColorPicker
              value={newItemColor}
              onChange={(color: Color) => setNewItemColor(color.toHexString())}
              showText
            />
          </div>
          
          <div style={{ marginTop: 16 }}>
            <span>预览：</span>
            <Tag color={newItemColor} style={{ marginLeft: 8 }}>{newItemName || '预览'}</Tag>
          </div>
        </Space>
      </Modal>
    );
  };

  return (
    <div style={{ marginTop: 24 }}>
      <Collapse bordered={false} expandIconPosition="end">
        <Panel 
          header={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AppstoreOutlined style={{ marginRight: 8 }} />
              <span>分类与标签管理</span>
            </div>
          } 
          key="1"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Title level={5} style={{ margin: 0 }}>
                <AppstoreOutlined /> 分类
              </Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="small"
                onClick={() => openAddModal('category')}
              >
                添加分类
              </Button>
            </div>
            
            <List
              size="small"
              dataSource={categories}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      icon={<EditOutlined />} 
                      size="small" 
                      type="text"
                      onClick={() => openEditModal('category', item)}
                    />,
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      type="text"
                      danger
                      disabled={item.id === 'default'} // 不允许删除默认分类
                      onClick={() => handleDelete('category', item.id)}
                    />
                  ]}
                >
                  <Tag color={item.color} style={{ marginRight: 8 }}>{item.name}</Tag>
                  {item.id === 'default' && <span style={{ fontSize: 12, color: '#999' }}>(默认)</span>}
                </List.Item>
              )}
            />
            
            <Divider style={{ margin: '16px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Title level={5} style={{ margin: 0 }}>
                <TagsOutlined /> 标签
              </Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="small"
                onClick={() => openAddModal('tag')}
              >
                添加标签
              </Button>
            </div>
            
            <List
              size="small"
              dataSource={tags}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      icon={<EditOutlined />} 
                      size="small" 
                      type="text"
                      onClick={() => openEditModal('tag', item)}
                    />,
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      type="text"
                      danger
                      onClick={() => handleDelete('tag', item.id)}
                    />
                  ]}
                >
                  <Tag color={item.color} style={{ marginRight: 8 }}>{item.name}</Tag>
                </List.Item>
              )}
            />
          </div>
        </Panel>
      </Collapse>
      
      {renderModalContent()}
    </div>
  );
};

export default CategoryManager; 