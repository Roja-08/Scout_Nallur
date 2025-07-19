import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, Modal, message, Avatar, Space, Layout, Menu, Form, Input, Row, Col, Typography, Tooltip, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, QrcodeOutlined, DownloadOutlined, MoreOutlined, UserOutlined } from '@ant-design/icons';
import { logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../utils/cloudinary';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

export default function ViewAllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  const email = localStorage.getItem('adminEmail') || 'Super Admin';
  const navigate = useNavigate();
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [editPreview, setEditPreview] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
      else message.error(data.message || 'Failed to fetch users');
    } catch (err) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        message.success('User deleted');
        setUsers(users.filter(u => u._id !== id));
      } else {
        message.error(data.message || 'Failed to delete user');
      }
    } catch (err) {
      message.error('Failed to delete user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditModalVisible(true);
    setEditProfilePic(null);
    setEditPreview(user.profilePic || '');
    editForm.setFieldsValue({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      nic: user.nic || '',
      school: user.school || '',
      age: user.age || ''
    });
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    editForm.resetFields();
    setEditProfilePic(null);
    setEditPreview('');
    setEditLoading(false);
  };

  const handleEditFileChange = e => {
    const file = e.target.files[0];
    setEditProfilePic(file || null);
    setEditPreview(file ? URL.createObjectURL(file) : (editingUser?.profilePic || ''));
  };

  const handleEditSubmit = async () => {
    try {
      setEditLoading(true);
      const values = await editForm.validateFields();
      let profilePicUrl = editingUser.profilePic;
      
      if (editProfilePic) {
        try {
          profilePicUrl = await uploadToCloudinary(editProfilePic);
        } catch (uploadError) {
          message.error('Failed to upload profile picture');
          setEditLoading(false);
          return;
        }
      }
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...values, profilePic: profilePicUrl }),
      });
      
      const data = await res.json();
      if (res.ok) {
        message.success('User updated successfully');
        setEditModalVisible(false);
        setTimeout(fetchUsers, 500);
      } else {
        message.error(data.message || 'Failed to update user');
      }
    } catch (err) {
      if (err.errorFields) {
        message.error('Please check the form fields');
      } else {
        message.error('Failed to update user');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleResendQR = async (userId, userName) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${userId}/resend-qr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        message.success(`QR code sent to ${userName}'s email successfully!`);
      } else {
        message.error(data.message || 'Failed to send QR code');
      }
    } catch (err) {
      message.error('Failed to send QR code');
    }
  };

  // Enhanced mobile responsive columns
  const columns = [
    { 
      title: 'ID', 
      dataIndex: '_id', 
      key: '_id',
      responsive: ['lg'],
      render: (id) => <Text code style={{ fontSize: 11 }}>{id}</Text>
    },
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      responsive: ['lg'],
      render: (name) => <Text strong>{name}</Text>
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      responsive: ['lg'],
      render: (email) => <Text>{email}</Text>
    },
    { 
      title: 'Phone', 
      dataIndex: 'phoneNumber', 
      key: 'phoneNumber',
      responsive: ['lg'],
      render: (phone) => <Text>{phone}</Text>
    },
    { 
      title: 'NIC', 
      dataIndex: 'nic', 
      key: 'nic',
      responsive: ['lg'],
      render: (nic) => <Text code>{nic}</Text>
    },
    { 
      title: 'School',
      dataIndex: 'school',
      key: 'school',
      responsive: ['lg'],
      render: (school) => <Text>{school}</Text>
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      responsive: ['lg'],
      render: (age) => <Text>{age}</Text>
    },
    { 
      title: 'Profile', 
      dataIndex: 'profilePic', 
      key: 'profilePic',
      responsive: ['lg'],
      render: url => url ? <Avatar src={url} size={32} /> : <Avatar icon={<UserOutlined />} size={32} />
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, user) => (
        <Space wrap>
          <Tooltip title="View Profile">
            <Button
              shape="circle"
              icon={<EyeOutlined style={{ color: '#fff', fontSize: 20 }} />}
              style={{ background: '#00cec8', border: 'none', marginRight: 4, boxShadow: '0 2px 8px #00cec833' }}
              onClick={() => window.open(`${process.env.PUBLIC_URL || ''}/user/${user._id}`, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              shape="circle"
              icon={<EditOutlined style={{ color: '#fff', fontSize: 20 }} />}
              style={{ background: '#00cec8', border: 'none', marginRight: 4, boxShadow: '0 2px 8px #00cec833' }}
              onClick={() => handleEdit(user)}
            />
          </Tooltip>
          <Tooltip title="Resend QR Code">
            <Button
              shape="circle"
              icon={<QrcodeOutlined style={{ color: '#fff', fontSize: 20 }} />}
              style={{ background: '#1677ff', border: 'none', marginRight: 4, boxShadow: '0 2px 8px #1677ff33' }}
              onClick={() => handleResendQR(user._id, user.name)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete user?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(user._id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Button
              shape="circle"
              icon={<DeleteOutlined style={{ color: '#fff', fontSize: 20 }} />}
              style={{ background: '#ff4d4f', border: 'none', boxShadow: '0 2px 8px #ff4d4f33' }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <img
          src={process.env.PUBLIC_URL + '/IMG-20230930-WA0000-removebg-preview.png'}
          alt="Scout Logo"
          style={{ width: 100, height: 100, objectFit: 'contain', display: 'block', margin: '24px auto', padding: 0 }}
        />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['view-all-users']}
          onClick={({ key }) => {
            if (key === 'overview') navigate('/dashboard/super');
            if (key === 'add') navigate('/dashboard/super/add-user');
            if (key === 'view-all-users') navigate('/dashboard/super/view-all-users');
            if (key === 'update-duty') navigate('/dashboard/super/update-duty');
            if (key === 'attendance-history') navigate('/dashboard/super/attendance-history');
          }}
          items={[
            { key: 'overview', label: 'Overview' },
            { key: 'add', label: 'Add New User' },
            { key: 'view-all-users', label: 'View All Users' },
            { key: 'update-duty', label: 'Update Duty Times' },
            { key: 'attendance-history', label: 'Attendance History' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
          <div>
            <b>{email}</b> <span style={{ color: '#1677ff', marginLeft: 8 }}>[super]</span>
          </div>
          <Button type="primary" danger style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={logout}>Logout</Button>
        </Header>
        <Content style={{ margin: { xs: 12, md: 24 }, background: '#fff', borderRadius: 8, minHeight: 400, padding: { xs: 16, md: 24 } }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>All Users</Title>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                style={{ background: '#00b894', borderColor: '#00b894', fontWeight: 600 }}
                onClick={() => {
                  const csvContent = [
                    ['User ID', 'Name', 'Email', 'Phone Number', 'NIC', 'Profile Picture URL'],
                    ...users.map(user => [
                      user._id,
                      user.name || '',
                      user.email || '',
                      user.phoneNumber || '',
                      user.nic || '',
                      user.profilePic || ''
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `all_users_${new Date().toISOString().split('T')[0]}.csv`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="rounded-lg px-6 py-2 text-base shadow-soft hover:bg-green-700 transition"
              >
                Export to CSV
              </Button>
            </Col>
          </Row>
          
          {/* Desktop table view */}
          <div style={{ display: { xs: 'none', md: 'block' } }}>
            <Table 
              columns={columns} 
              dataSource={users} 
              rowKey="_id" 
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
                pageSizeOptions: ['10', '20', '50', '100'],
                responsive: true
              }}
              size="middle"
            />
          </div>
          
          <Modal
            title="Edit User"
            open={editModalVisible}
            onCancel={handleEditModalClose}
            onOk={handleEditSubmit}
            okText="Save"
            cancelText="Cancel"
            confirmLoading={editLoading}
            width={600}
            destroyOnClose
          >
            <Form
              form={editForm}
              layout="vertical"
              autoComplete="off"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter name' }]}
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="Enter email" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phone Number"
                    name="phoneNumber"
                    rules={[{ required: true, message: 'Please enter phone number' }]}
                  >
                    <Input placeholder="Enter phone number" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="NIC"
                    name="nic"
                    rules={[{ required: true, message: 'Please enter NIC' }]}
                  >
                    <Input placeholder="Enter NIC" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="School"
                    name="school"
                    rules={[{ required: false }]}
                  >
                    <Input placeholder="Enter school" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Age"
                    name="age"
                    rules={[{ required: false, type: 'number', min: 1, max: 120, message: 'Please enter a valid age' }]}
                  >
                    <Input type="number" placeholder="Enter age" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="Profile Photo">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleEditFileChange}
                    style={{ flex: 1, minWidth: 200 }}
                  />
                  {editPreview && (
                    <Avatar src={editPreview} size={64} icon={<UserOutlined />} />
                  )}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Leave empty to keep current profile picture
                </Text>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
} 