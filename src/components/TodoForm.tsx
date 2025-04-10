import React, { useState } from 'react';
import { Input, Button, Form, Select, DatePicker, TimePicker, Space, Tag } from 'antd';
import { PlusOutlined, TagOutlined, CalendarOutlined, BellOutlined } from '@ant-design/icons';
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

interface TodoFormProps {
  addTodo: (text: string, categoryId?: string, tagIds?: string[], dueDate?: number, reminder?: number) => void;
  categories: Category[];
  tags: TodoTag[];
}

const TodoForm: React.FC<TodoFormProps> = ({ addTodo, categories, tags }) => {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('default');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<dayjs.Dayjs | null>(null);
  const [reminderTime, setReminderTime] = useState<dayjs.Dayjs | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      // 计算截止日期时间戳
      const dueDateTimestamp = dueDate ? dueDate.valueOf() : undefined;
      
      // 计算提醒时间戳
      const reminderTimestamp = reminderTime ? reminderTime.valueOf() : undefined;
      
      addTodo(text, selectedCategory, selectedTags, dueDateTimestamp, reminderTimestamp);
      
      // 重置表单
      setText('');
      if (showAdvanced) {
        setSelectedTags([]);
        setDueDate(null);
        setReminderTime(null);
      }
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Form layout="vertical" onSubmitCapture={handleSubmit}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Group compact style={{ display: 'flex' }}>
            <Select
              style={{ width: '25%' }}
              value={selectedCategory}
              onChange={setSelectedCategory}
              dropdownMatchSelectWidth={false}
            >
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  <Tag color={category.color}>{category.name}</Tag>
                </Select.Option>
              ))}
            </Select>
            <Input
              placeholder="添加新任务..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPressEnter={handleSubmit}
              style={{ 
                flex: 1, 
                borderRadius: '0',
                background: 'rgba(255, 255, 255, 0.6)',
                border: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}
            />
            <Button
              type="default"
              icon={showAdvanced ? <CalendarOutlined /> : <TagOutlined />}
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ 
                borderRadius: '0',
                border: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)' 
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleSubmit}
              style={{ 
                borderRadius: '0 12px 12px 0',
                background: 'rgba(24, 144, 255, 0.8)',
                border: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)' 
              }}
            />
          </Input.Group>
          
          {showAdvanced && (
            <div style={{ 
              padding: '12px', 
              background: 'rgba(255, 255, 255, 0.6)', 
              borderRadius: '12px',
              marginTop: '8px'
            }}>
              <Form.Item label="标签" style={{ marginBottom: '12px' }}>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="选择标签"
                  value={selectedTags}
                  onChange={setSelectedTags}
                  optionLabelProp="label"
                >
                  {tags.map(tag => (
                    <Select.Option key={tag.id} value={tag.id} label={tag.name}>
                      <Tag color={tag.color}>{tag.name}</Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Form.Item label="截止日期" style={{ marginBottom: '0' }}>
                  <DatePicker 
                    value={dueDate} 
                    onChange={setDueDate} 
                    format="YYYY-MM-DD"
                    placeholder="选择日期"
                    allowClear
                  />
                </Form.Item>
                
                <Form.Item label="提醒时间" style={{ marginBottom: '0' }}>
                  <DatePicker 
                    value={reminderTime} 
                    onChange={setReminderTime}
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    placeholder="选择时间"
                    allowClear
                  />
                </Form.Item>
              </Space>
            </div>
          )}
        </Space>
      </Form>
    </div>
  );
};

export default TodoForm; 