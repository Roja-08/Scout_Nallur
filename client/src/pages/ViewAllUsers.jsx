import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, Modal, Form, Input, message, Avatar, Space, Layout, Menu } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, QrcodeOutlined, DownloadOutlined } from '@ant-design/icons';
import { logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../utils/cloudinary';

const { Sider, Content, Header } = Layout;

export default function ViewAllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phoneNumber: '', nic: '' });
  const [editErrors, setEditErrors] = useState({});
  const email = localStorage.getItem('adminEmail') || 'Super Admin';
  const navigate = useNavigate();
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [editPreview, setEditPreview] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
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
      const res = await fetch(`/api/users/${id}`, {
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
    setEditForm({ name: user.name || '', email: user.email || '', phoneNumber: user.phoneNumber || '', nic: user.nic || '' });
    setEditErrors({});
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setTimeout(() => setEditForm({ name: '', email: '', phoneNumber: '', nic: '' }), 300);
    setEditErrors({});
  };

  const handleEditFileChange = e => {
    const file = e.target.files[0];
    setEditProfilePic(file || null);
    setEditPreview(file ? URL.createObjectURL(file) : (editingUser?.profilePic || ''));
  };

  const handleEditInputChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.name) errs.name = 'Please enter Name';
    if (!editForm.email) errs.email = 'Please enter Email';
    if (!editForm.phoneNumber) errs.phoneNumber = 'Please enter Phone Number';
    if (!editForm.nic) errs.nic = 'Please enter NIC';
    return errs;
  };

  const handleEditSubmit = async () => {
    const errs = validateEdit();
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      let profilePicUrl = editingUser.profilePic;
      if (editProfilePic) {
        profilePicUrl = await uploadToCloudinary(editProfilePic);
      }
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...editForm, profilePic: profilePicUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        message.success('User updated');
        setEditModalVisible(false);
        setTimeout(fetchUsers, 500);
      } else {
        message.error(data.message || 'Failed to update user');
      }
    } catch (err) {
      message.error('Failed to update user');
    }
  };

  const handleResendQR = async (userId, userName) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${userId}/resend-qr`, {
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

  const columns = [
    { title: 'ID', dataIndex: '_id', key: '_id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'NIC', dataIndex: 'nic', key: 'nic' },
    { title: 'Profile', dataIndex: 'profilePic', key: 'profilePic', render: url => url ? <Avatar src={url} /> : '-' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, user) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => window.open(`/user/${user._id}`, '_blank')}>View</Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(user)}>Edit</Button>
          <Button 
            icon={<QrcodeOutlined />} 
            onClick={() => handleResendQR(user._id, user.name)}
            title="Resend QR Code to Email"
          >
            Resend QR
          </Button>
          <Popconfirm title="Delete user?" onConfirm={() => handleDelete(user._id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, padding: 24 }}>Scout</div>
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
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <b>{email}</b> <span style={{ color: '#1677ff', marginLeft: 8 }}>[super]</span>
          </div>
          <Button type="primary" danger onClick={logout}>Logout</Button>
        </Header>
        <Content style={{ margin: 24, background: '#fff', borderRadius: 8, minHeight: 400, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>All Users</h2>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
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
            >
              Export to CSV
            </Button>
          </div>
          <Table columns={columns} dataSource={users} rowKey="_id" loading={loading} />
          <Modal
            title="Edit User"
            open={editModalVisible}
            onCancel={handleEditModalClose}
            onOk={handleEditSubmit}
            okText="Save"
          >
            <form onSubmit={e => { e.preventDefault(); handleEditSubmit(); }} autoComplete="off">
              <div style={{ marginBottom: 16 }}>
                <label>Name *</label><br />
                <input name="name" value={editForm.name} onChange={handleEditInputChange} style={{ width: '100%', padding: 8 }} />
                {editErrors.name && <div style={{ color: 'red' }}>{editErrors.name}</div>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Email *</label><br />
                <input name="email" type="email" value={editForm.email} onChange={handleEditInputChange} style={{ width: '100%', padding: 8 }} />
                {editErrors.email && <div style={{ color: 'red' }}>{editErrors.email}</div>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Phone Number *</label><br />
                <input name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditInputChange} style={{ width: '100%', padding: 8 }} />
                {editErrors.phoneNumber && <div style={{ color: 'red' }}>{editErrors.phoneNumber}</div>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>NIC *</label><br />
                <input name="nic" value={editForm.nic} onChange={handleEditInputChange} style={{ width: '100%', padding: 8 }} />
                {editErrors.nic && <div style={{ color: 'red' }}>{editErrors.nic}</div>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Profile Photo</label><br />
                <input type="file" accept="image/*" onChange={handleEditFileChange} />
                {editPreview && <Avatar src={editPreview} size={64} style={{ marginTop: 8 }} />}
              </div>
              <button type="submit" style={{ padding: '8px 24px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4 }}>
                Save
              </button>
            </form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
} 