import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Button, Card, Row, Col, Statistic, List, Avatar, Table, DatePicker, message, Space, Form, Input, Select, Typography, Alert } from 'antd';
import Home from './pages/Home';
import Login from './Login';
import { isAuthenticated, getAdminRole, logout, startSessionTimer, resetSessionTimer } from './utils/auth';
import AddUserForm from './components/AddUserForm';
import UserStatusPage from './pages/UserStatusPage';
import ViewAllUsers from './pages/ViewAllUsers';
import { TrophyTwoTone, CrownTwoTone, SmileTwoTone, LikeTwoTone, DownloadOutlined, QrcodeOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { QrReader } from '@blackbox-vision/react-qr-reader';

dayjs.extend(customParseFormat);

// Use environment variable for API URL, fallback to empty string for proxy
const API_URL = process.env.REACT_APP_API_URL || '';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

function useSessionTimeout() {
  useEffect(() => {
    startSessionTimer();
    const reset = () => resetSessionTimer();
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    return () => {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
    };
  }, []);
}

function SuperAdminDashboard() {
  useSessionTimeout();
  const email = localStorage.getItem('adminEmail') || 'Super Admin';
  const navigate = useNavigate();
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch {}
    }
    fetchUsers();
  }, []);

  function calculateLiveDutyTime(user) {
    if (!user.attendance) return 0;
    console.log("[DEBUG] User:", user.name, "Attendance:", user.attendance);
    let total = 0;
    const today = dayjs().format('YYYY-MM-DD');
    const currentTime = dayjs();
    
    user.attendance.forEach((a, idx) => {
      console.log(
        `[DEBUG] Record #${idx}: date=${a.date}, comingTime=${a.comingTime}, finishingTime=${a.finishingTime}`
      );
      if (a.comingTime && a.finishingTime) {
        const start = dayjs(`${a.date} ${a.comingTime}`, "YYYY-MM-DD HH:mm");
        const end = dayjs(`${a.date} ${a.finishingTime}`, "YYYY-MM-DD HH:mm");
        console.log(
          `[DEBUG] Parsed: start=${start.format("YYYY-MM-DD HH:mm")}, end=${end.format("YYYY-MM-DD HH:mm")}, start valid: ${start.isValid()}, end valid: ${end.isValid()}, diff: ${end.diff(start, "minute")}`
        );
        total += Math.max(0, end.diff(start, 'minute'));
      } else if (a.comingTime && !a.finishingTime && a.date === today) {
        // Live calculation for active users today
        const start = dayjs(`${a.date} ${a.comingTime}`, "YYYY-MM-DD HH:mm");
        if (start.isValid()) {
          const liveMinutes = Math.max(0, currentTime.diff(start, 'minute'));
          console.log(`[DEBUG] Live calculation: ${liveMinutes} minutes from ${start.format("HH:mm")} to now`);
          total += liveMinutes;
        }
      }
    });
    return total;
  }

  // Convert minutes to hours and minutes format
  function formatDutyTime(minutes) {
    if (minutes === 0) return '0 hours';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours} hours`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  // Always recalculate from attendance array, ignore totalDutyTime from backend
  const totalDutyTime = users.reduce((sum, u) => sum + calculateLiveDutyTime(u), 0);
  const topUsers = [...users].sort((a, b) => calculateLiveDutyTime(b) - calculateLiveDutyTime(a)).slice(0, 5);

  const trophyIcons = [
    <CrownTwoTone twoToneColor="#FFD700" style={{ fontSize: 24 }} />, // Gold
    <TrophyTwoTone twoToneColor="#C0C0C0" style={{ fontSize: 24 }} />, // Silver
    <TrophyTwoTone twoToneColor="#CD7F32" style={{ fontSize: 24 }} />, // Bronze
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, padding: 24 }}>Scout</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['overview']}
          onClick={({ key }) => {
            if (key === 'view-all-users') navigate('/dashboard/super/view-all-users');
            if (key === 'overview') navigate('/dashboard/super');
            if (key === 'add') navigate('/dashboard/super/add-user');
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
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic title="Total Users" value={users.length} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic title="Total Duty Time" value={formatDutyTime(totalDutyTime)} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic title="Active Users" value={users.filter(u => u.attendance && u.attendance.some(a => a.date === dayjs().format('YYYY-MM-DD') && a.comingTime && !a.finishingTime)).length} />
              </Card>
            </Col>
          </Row>
          <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
            <Col xs={24} md={16}>
              <Card title="Leaderboard: Most Duty Time" bordered={false} style={{ borderRadius: 12 }}>
                {topUsers.length > 0 && (
                  <div style={{ marginBottom: 16, textAlign: 'center', fontWeight: 600, fontSize: 18 }}>
                    <SmileTwoTone twoToneColor="#52c41a" style={{ fontSize: 28, marginRight: 8 }} />
                    Congrats <span style={{ color: '#1677ff' }}>{topUsers[0].name}</span> for your outstanding service!
                  </div>
                )}
                <List
                  itemLayout="horizontal"
                  dataSource={topUsers}
                  renderItem={(user, idx) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<span>{
                          idx < 3 ? trophyIcons[idx] : <LikeTwoTone twoToneColor="#1677ff" style={{ fontSize: 22 }} />
                        } <Avatar src={user.profilePic} style={{ marginLeft: 6 }} /></span>}
                        title={<span>{user.name} <span style={{ color: '#888', fontSize: 12 }}>({user._id})</span></span>}
                        description={<span>Duty Time: <b>{formatDutyTime(calculateLiveDutyTime(user))}</b></span>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Quick Actions" bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
                <ul style={{ paddingLeft: 20 }}>
                  <li><button type="button" style={{ background: 'none', border: 'none', color: '#1677ff', cursor: 'pointer', padding: 0, textDecoration: 'underline' }} onClick={() => navigate('/dashboard/super/view-all-users')}>View All Users</button></li>
                  <li><button type="button" style={{ background: 'none', border: 'none', color: '#1677ff', cursor: 'pointer', padding: 0, textDecoration: 'underline' }} onClick={() => navigate('/dashboard/super/add-user')}>Add New User</button></li>
                </ul>
              </Card>
              <Card title="Recent Activities" bordered={false} style={{ borderRadius: 12 }}>
                <ul style={{ paddingLeft: 20 }}>
                  <li>User IT23203112 added by Super Admin</li>
                  <li>User 686e9b849ad9 updated profile</li>
                  <li>User 686e9b849ad9 deleted by Super Admin</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}

function SecondaryAdminDashboard() {
  useSessionTimeout();
  const email = localStorage.getItem('adminEmail') || 'Secondary Admin';
  const navigate = useNavigate();
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch {}
    }
    fetchUsers();
  }, []);

  function calculateLiveDutyTime(user) {
    if (!user.attendance) return 0;
    console.log("[DEBUG] User:", user.name, "Attendance:", user.attendance);
    let total = 0;
    const today = dayjs().format('YYYY-MM-DD');
    const currentTime = dayjs();
    
    user.attendance.forEach((a, idx) => {
      console.log(
        `[DEBUG] Record #${idx}: date=${a.date}, comingTime=${a.comingTime}, finishingTime=${a.finishingTime}`
      );
      if (a.comingTime && a.finishingTime) {
        const start = dayjs(`${a.date} ${a.comingTime}`, "YYYY-MM-DD HH:mm");
        const end = dayjs(`${a.date} ${a.finishingTime}`, "YYYY-MM-DD HH:mm");
        console.log(
          `[DEBUG] Parsed: start=${start.format("YYYY-MM-DD HH:mm")}, end=${end.format("YYYY-MM-DD HH:mm")}, start valid: ${start.isValid()}, end valid: ${end.isValid()}, diff: ${end.diff(start, "minute")}`
        );
        total += Math.max(0, end.diff(start, 'minute'));
      } else if (a.comingTime && !a.finishingTime && a.date === today) {
        // Live calculation for active users today
        const start = dayjs(`${a.date} ${a.comingTime}`, "YYYY-MM-DD HH:mm");
        if (start.isValid()) {
          const liveMinutes = Math.max(0, currentTime.diff(start, 'minute'));
          console.log(`[DEBUG] Live calculation: ${liveMinutes} minutes from ${start.format("HH:mm")} to now`);
          total += liveMinutes;
        }
      }
    });
    return total;
  }

  // Convert minutes to hours and minutes format
  function formatDutyTime(minutes) {
    if (minutes === 0) return '0 hours';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours} hours`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  // Always recalculate from attendance array, ignore totalDutyTime from backend
  const totalDutyTime = users.reduce((sum, u) => sum + calculateLiveDutyTime(u), 0);
  const topUsers = [...users].sort((a, b) => calculateLiveDutyTime(b) - calculateLiveDutyTime(a)).slice(0, 5);

  const trophyIcons = [
    <CrownTwoTone twoToneColor="#FFD700" style={{ fontSize: 24 }} />, // Gold
    <TrophyTwoTone twoToneColor="#C0C0C0" style={{ fontSize: 24 }} />, // Silver
    <TrophyTwoTone twoToneColor="#CD7F32" style={{ fontSize: 24 }} />, // Bronze
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, padding: 24 }}>Scout</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['overview']}
          onClick={({ key }) => {
            if (key === 'overview') navigate('/dashboard/secondary');
            if (key === 'view-users') navigate('/dashboard/secondary/view-users');
            if (key === 'update') navigate('/dashboard/secondary/update-duty');
            if (key === 'attendance-history') navigate('/dashboard/secondary/attendance-history');
          }}
          items={[
            { key: 'overview', label: 'Overview' },
            { key: 'view-users', label: 'View Users' },
            { key: 'update', label: 'Update Duty Times' },
            { key: 'attendance-history', label: 'Attendance History' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <b>{email}</b> <span style={{ color: '#1677ff', marginLeft: 8 }}>[secondary]</span>
          </div>
          <Button type="primary" danger onClick={logout}>Logout</Button>
        </Header>
        <Content style={{ margin: 24, background: '#fff', borderRadius: 8, minHeight: 400, padding: 24 }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic title="Total Users" value={users.length} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic title="Total Duty Time" value={formatDutyTime(totalDutyTime)} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12 }}>
                <Statistic title="Active Users" value={users.filter(u => u.attendance && u.attendance.some(a => a.date === dayjs().format('YYYY-MM-DD') && a.comingTime && !a.finishingTime)).length} />
              </Card>
            </Col>
          </Row>
          <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
            <Col xs={24} md={16}>
              <Card title="Leaderboard: Most Duty Time" bordered={false} style={{ borderRadius: 12 }}>
                {topUsers.length > 0 && (
                  <div style={{ marginBottom: 16, textAlign: 'center', fontWeight: 600, fontSize: 18 }}>
                    <SmileTwoTone twoToneColor="#52c41a" style={{ fontSize: 28, marginRight: 8 }} />
                    Congrats <span style={{ color: '#1677ff' }}>{topUsers[0].name}</span> for your outstanding service!
                  </div>
                )}
                <List
                  itemLayout="horizontal"
                  dataSource={topUsers}
                  renderItem={(user, idx) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<span>{
                          idx < 3 ? trophyIcons[idx] : <LikeTwoTone twoToneColor="#1677ff" style={{ fontSize: 22 }} />
                        } <Avatar src={user.profilePic} style={{ marginLeft: 6 }} /></span>}
                        title={<span>{user.name} <span style={{ color: '#888', fontSize: 12 }}>({user._id})</span></span>}
                        description={<span>Duty Time: <b>{formatDutyTime(calculateLiveDutyTime(user))}</b></span>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Quick Actions" bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
                <ul style={{ paddingLeft: 20 }}>
                  <li><button type="button" style={{ background: 'none', border: 'none', color: '#1677ff', cursor: 'pointer', padding: 0, textDecoration: 'underline' }} onClick={() => navigate('/dashboard/secondary/view-users')}>View Users</button></li>
                  <li><button type="button" style={{ background: 'none', border: 'none', color: '#1677ff', cursor: 'pointer', padding: 0, textDecoration: 'underline' }} onClick={() => navigate('/dashboard/secondary/update-duty')}>Update Duty Times</button></li>
                </ul>
              </Card>
              <Card title="Recent Activities" bordered={false} style={{ borderRadius: 12 }}>
                <ul style={{ paddingLeft: 20 }}>
                  <li>User IT23203112 duty time updated</li>
                  <li>User 686e9b849ad9 marked as active</li>
                  <li>User 686e9b849ad9 marked as inactive</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}

function SecondaryAdminViewUsers() {
  useSessionTimeout();
  const email = localStorage.getItem('adminEmail') || 'Secondary Admin';
  const navigate = useNavigate();
  const [users, setUsers] = React.useState([]);
  const [search, setSearch] = React.useState('');

  function calculateLiveDutyTime(user) {
    if (!user.attendance) return 0;
    let total = 0;
    const today = dayjs().format('YYYY-MM-DD');
    const currentTime = dayjs();
    user.attendance.forEach(a => {
      if (a.comingTime && a.finishingTime) {
        const start = dayjs(`${a.date} ${a.comingTime}`, "YYYY-MM-DD HH:mm");
        const end = dayjs(`${a.date} ${a.finishingTime}`, "YYYY-MM-DD HH:mm");
        if (start.isValid() && end.isValid()) {
          total += Math.max(0, end.diff(start, 'minute'));
        }
      } else if (a.comingTime && !a.finishingTime && a.date === today) {
        const start = dayjs(`${a.date} ${a.comingTime}`, "YYYY-MM-DD HH:mm");
        if (start.isValid()) {
          total += Math.max(0, currentTime.diff(start, 'minute'));
        }
      }
    });
    return total;
  }

  function formatDutyTime(minutes) {
    if (minutes === 0) return '0 hours';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours} hours`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phoneNumber.toLowerCase().includes(search.toLowerCase()) ||
    u.nic.toLowerCase().includes(search.toLowerCase()) ||
    (u._id && u._id.toLowerCase().includes(search.toLowerCase()))
  );

  const handleResendQR = async (userId, userName) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${userId}/resend-qr`, {
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
    { title: 'Duty Time', key: 'dutyTime', render: (_, user) => formatDutyTime(calculateLiveDutyTime(user)) },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, user) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => window.open(`/user/${user._id}`, '_blank')}>View</Button>
          <Button 
            icon={<QrcodeOutlined />} 
            onClick={() => handleResendQR(user._id, user.name)}
            title="Resend QR Code to Email"
          >
            Resend QR
          </Button>
        </Space>
      ),
    },
  ];

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch {}
    }
    fetchUsers();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, padding: 24 }}>Scout</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['view-users']}
          onClick={({ key }) => {
            if (key === 'overview') navigate('/dashboard/secondary');
            if (key === 'view-users') navigate('/dashboard/secondary/view-users');
            if (key === 'update') navigate('/dashboard/secondary/update-duty');
            if (key === 'attendance-history') navigate('/dashboard/secondary/attendance-history');
          }}
          items={[
            { key: 'overview', label: 'Overview' },
            { key: 'view-users', label: 'View Users' },
            { key: 'update', label: 'Update Duty Times' },
            { key: 'attendance-history', label: 'Attendance History' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <b>{email}</b> <span style={{ color: '#1677ff', marginLeft: 8 }}>[secondary]</span>
          </div>
          <Button type="primary" danger onClick={logout}>Logout</Button>
        </Header>
        <Content style={{ margin: 24, background: '#fff', borderRadius: 8, minHeight: 400, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>View Users</h2>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => {
                const csvContent = [
                  ['User ID', 'Name', 'Email', 'Phone Number', 'NIC', 'Profile Picture URL'],
                  ...filteredUsers.map(user => [
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
                link.setAttribute('download', `view_users_${dayjs().format('YYYY-MM-DD')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Export to CSV
            </Button>
          </div>
          <input
            placeholder="Search by name, email, phone, NIC, or ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 16, width: 320, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <Table columns={columns} dataSource={filteredUsers} rowKey="_id" />
        </Content>
      </Layout>
    </Layout>
  );
}

function AddUserPage() {
  useSessionTimeout();
  const email = localStorage.getItem('adminEmail') || 'Super Admin';
  const navigate = useNavigate();
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, padding: 24 }}>Scout</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['add']}
          onClick={({ key }) => {
            if (key === 'view-all-users') navigate('/dashboard/super/view-all-users');
            if (key === 'overview') navigate('/dashboard/super');
            if (key === 'add') navigate('/dashboard/super/add-user');
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
          <h2>Add New User</h2>
          <AddUserForm />
        </Content>
      </Layout>
    </Layout>
  );
}

// Move QrScanner definition above its first usage
function QrScanner({ onScan }) {
  return (
    <div style={{ maxWidth: 350, margin: '0 auto', marginBottom: 16 }}>
      <QrReader
        constraints={{ facingMode: 'environment' }}
        onResult={(result, error) => {
          if (!!result) {
            onScan(result?.text);
          }
        }}
        style={{ width: '100%' }}
      />
    </div>
  );
}

function SecondaryAdminUpdateDuty() {
  useSessionTimeout();
  const email = localStorage.getItem('adminEmail') || 'Secondary Admin';
  const navigate = useNavigate();
  const [users, setUsers] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [comingTime, setComingTime] = React.useState('');
  const [finishingTime, setFinishingTime] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [date, setDate] = React.useState(dayjs().format('YYYY-MM-DD'));
  const [attendance, setAttendance] = React.useState([]);

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch {}
    }
    fetchUsers();
  }, []);

  React.useEffect(() => {
    async function fetchUserDetails() {
      if (selectedId) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/users/${selectedId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setSelectedUser(data);
          setAttendance(data.attendance || []);
        } else {
          setSelectedUser(null);
          setAttendance([]);
        }
      } else {
        setSelectedUser(null);
        setAttendance([]);
      }
      setComingTime('');
      setFinishingTime('');
      setSuccessMsg('');
      setErrorMsg('');
    }
    fetchUserDetails();
  }, [selectedId]);

  React.useEffect(() => {
    // Set coming/finishing time for selected date if exists
    if (attendance && date) {
      const att = attendance.find(a => a.date === date);
      setComingTime(att?.comingTime || '');
      setFinishingTime(att?.finishingTime || '');
    }
  }, [date, attendance]);

  const handleUpdateComing = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!selectedId) return setErrorMsg('Please select a user.');
    if (!date) return setErrorMsg('Please select a date.');
    if (!comingTime) return setErrorMsg('Please enter coming time.');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${selectedId}/duty`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date, comingTime }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Coming time updated successfully!');
        setTimeout(() => setSuccessMsg(''), 2000);
        // Refresh user details
        const userRes = await fetch(`${API_URL}/api/users/${selectedId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (userRes.ok) {
          setSelectedUser(userData);
          setAttendance(userData.attendance || []);
        }
      } else {
        setErrorMsg(data.message || 'Failed to update coming time');
      }
    } catch {
      setErrorMsg('Failed to update coming time');
    }
  };

  const handleUpdateFinishing = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!selectedId) return setErrorMsg('Please select a user.');
    if (!date) return setErrorMsg('Please select a date.');
    if (!finishingTime) return setErrorMsg('Please enter finishing time.');
    // Check if comingTime exists and is before finishingTime
    if (comingTime && finishingTime) {
      const [ch, cm] = comingTime.split(':').map(Number);
      const [fh, fm] = finishingTime.split(':').map(Number);
      const start = ch * 60 + cm;
      const end = fh * 60 + fm;
      if (end <= start) {
        setErrorMsg('Finishing time must be after coming time.');
        return;
      }
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${selectedId}/duty`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date, finishingTime }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Finishing time updated successfully!');
        setTimeout(() => setSuccessMsg(''), 2000);
        // Refresh user details
        const userRes = await fetch(`${API_URL}/api/users/${selectedId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (userRes.ok) {
          setSelectedUser(userData);
          setAttendance(userData.attendance || []);
        }
      } else {
        setErrorMsg(data.message || 'Failed to update finishing time');
      }
    } catch {
      setErrorMsg('Failed to update finishing time');
    }
  };

  const attendanceColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Coming Time', dataIndex: 'comingTime', key: 'comingTime' },
    { title: 'Finishing Time', dataIndex: 'finishingTime', key: 'finishingTime' },
    { 
      title: 'Duty Time', 
      key: 'dutyTime',
      render: (_, record) => {
        if (record.comingTime && record.finishingTime) {
          const start = dayjs(`${record.date} ${record.comingTime}`, "YYYY-MM-DD HH:mm");
          const end = dayjs(`${record.date} ${record.finishingTime}`, "YYYY-MM-DD HH:mm");
          if (start.isValid() && end.isValid()) {
            const minutes = end.diff(start, 'minute');
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
          }
        }
        return '-';
      }
    },
  ];

  const handleQrScan = async (scannedText) => {
    if (!scannedText) return;
    // Assume QR code contains the user profile link or just the user ID
    let userId = scannedText;
    // If QR code is a URL, extract the user ID
    const match = scannedText.match(/\/user\/([\w-]+)/);
    if (match) userId = match[1];
    setSelectedId(userId);
    // Fetch user details and auto-update coming/finishing time
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedUser(data);
        setAttendance(data.attendance || []);
        const today = dayjs().format('YYYY-MM-DD');
        const todayRecord = (data.attendance || []).find(a => a.date === today);
        if (!todayRecord || !todayRecord.comingTime) {
          // Auto-update coming time
          const now = dayjs().format('HH:mm');
          await fetch(`${API_URL}/api/users/${userId}/duty`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ date: today, comingTime: now }),
          });
          setComingTime(now);
          setSuccessMsg('Coming time updated automatically!');
        } else if (todayRecord.comingTime && !todayRecord.finishingTime) {
          // Auto-update finishing time
          const now = dayjs().format('HH:mm');
          await fetch(`${API_URL}/api/users/${userId}/duty`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ date: today, finishingTime: now }),
          });
          setFinishingTime(now);
          setSuccessMsg('Finishing time updated automatically!');
        } else {
          setSuccessMsg('Today\'s duty already completed.');
        }
      } else {
        setErrorMsg(data.message || 'User not found');
      }
    } catch (err) {
      setErrorMsg('Failed to fetch user details');
    } finally {
      // setQrScanLoading(false); // Removed as per edit hint
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, padding: 24 }}>Scout</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['update']}
          onClick={({ key }) => {
            if (key === 'overview') navigate('/dashboard/secondary');
            if (key === 'view-users') navigate('/dashboard/secondary/view-users');
            if (key === 'update') navigate('/dashboard/secondary/update-duty');
            if (key === 'attendance-history') navigate('/dashboard/secondary/attendance-history');
          }}
          items={[
            { key: 'overview', label: 'Overview' },
            { key: 'view-users', label: 'View Users' },
            { key: 'update', label: 'Update Duty Times' },
            { key: 'attendance-history', label: 'Attendance History' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <b>{email}</b> <span style={{ color: '#1677ff', marginLeft: 8 }}>[secondary]</span>
          </div>
          <Button type="primary" danger onClick={logout}>Logout</Button>
        </Header>
        <Content style={{ margin: 24, background: '#fff', borderRadius: 8, minHeight: 400, padding: 24 }}>
          <h2>Update Duty Times</h2>
          <form onSubmit={handleUpdateComing} style={{ maxWidth: 500, margin: '0 auto', background: '#f7faff', borderRadius: 8, padding: 24, boxShadow: '0 2px 12px #e6f7ff' }}>
            <div style={{ marginBottom: 16 }}>
              <label>User ID *</label><br />
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ width: '100%', padding: 8 }}>
                <option value="">Select a user</option>
                {users.map(u => <option key={u._id} value={u._id}>{u._id} - {u.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Date *</label><br />
              <DatePicker
                value={date ? dayjs(date) : null}
                onChange={d => setDate(d ? d.format('YYYY-MM-DD') : '')}
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                allowClear={false}
                disabledDate={d => d && d.isAfter(dayjs(), 'day')}
              />
            </div>
            {selectedUser && (
              <div style={{ marginBottom: 16, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 6px #e6f7ff' }}>
                <b>Name:</b> {selectedUser.name}<br />
                <b>Email:</b> {selectedUser.email}<br />
                <b>Phone:</b> {selectedUser.phoneNumber}<br />
                <b>NIC:</b> {selectedUser.nic}<br />
                <b>Current Duty Time:</b> {selectedUser.dutyTime} min<br />
                {selectedUser.profilePic && <img src={selectedUser.profilePic} alt="Profile" style={{ width: 64, height: 64, borderRadius: '50%', marginTop: 8 }} />}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label>Coming Time</label><br />
              <input type="time" value={comingTime} onChange={e => setComingTime(e.target.value)} style={{ width: '100%', padding: 8 }} />
              <button onClick={handleUpdateComing} style={{ marginTop: 8, padding: '6px 18px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4 }}>Update Coming Time</button>
            </div>
            {comingTime && (
              <div style={{ marginBottom: 16 }}>
                <label>Finishing Time</label><br />
                <input type="time" value={finishingTime} onChange={e => setFinishingTime(e.target.value)} style={{ width: '100%', padding: 8 }} />
                <button onClick={handleUpdateFinishing} style={{ marginTop: 8, padding: '6px 18px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4 }}>Update Finishing Time</button>
              </div>
            )}
            {errorMsg && <div style={{ color: 'red', marginBottom: 12 }}>{errorMsg}</div>}
            {successMsg && <div style={{ color: 'green', marginBottom: 12 }}>{successMsg}</div>}
          </form>
          
          {/* Selected User Attendance Records */}
          {attendance && attendance.length > 0 && (
            <div style={{ maxWidth: 700, margin: '40px auto 0 auto' }}>
              <h3>Selected User Attendance Records</h3>
              <Table columns={attendanceColumns} dataSource={attendance} rowKey="date" />
            </div>
          )}
          <QrScanner onScan={handleQrScan} />
        </Content>
      </Layout>
    </Layout>
  );
}

function SuperAdminUpdateDuty() {
  useSessionTimeout();
  const email = localStorage.getItem('adminEmail') || 'Super Admin';
  const navigate = useNavigate();
  const [users, setUsers] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [comingTime, setComingTime] = React.useState('');
  const [finishingTime, setFinishingTime] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [date, setDate] = React.useState(dayjs().format('YYYY-MM-DD'));
  const [attendance, setAttendance] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    async function fetchUsers() {
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
    }
    fetchUsers();
  }, []);

  React.useEffect(() => {
    async function fetchUserDetails() {
      if (selectedId) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${selectedId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            setSelectedUser(data);
            setAttendance(data.attendance || []);
          } else {
            setSelectedUser(null);
            setAttendance([]);
            message.error(data.message || 'Failed to fetch user details');
          }
        } catch (err) {
          setSelectedUser(null);
          setAttendance([]);
          message.error('Failed to fetch user details');
        }
      } else {
        setSelectedUser(null);
        setAttendance([]);
      }
      setComingTime('');
      setFinishingTime('');
      setSuccessMsg('');
      setErrorMsg('');
    }
    fetchUserDetails();
  }, [selectedId]);

  React.useEffect(() => {
    // Set coming/finishing time for selected date if exists
    if (attendance && date) {
      const att = attendance.find(a => a.date === date);
      setComingTime(att?.comingTime || '');
      setFinishingTime(att?.finishingTime || '');
    }
  }, [date, attendance]);

  const handleUpdateComing = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setUpdating(true);
    
    if (!selectedId) {
      setErrorMsg('Please select a user.');
      setUpdating(false);
      return;
    }
    if (!date) {
      setErrorMsg('Please select a date.');
      setUpdating(false);
      return;
    }
    if (!comingTime) {
      setErrorMsg('Please enter coming time.');
      setUpdating(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${selectedId}/duty`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date, comingTime }),
      });
      const data = await res.json();
      if (res.ok) {
        message.success('Coming time updated successfully!');
        // Refresh user details
        const userRes = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${selectedId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (userRes.ok) {
          setSelectedUser(userData);
          setAttendance(userData.attendance || []);
        }
      } else {
        message.error(data.message || 'Failed to update coming time');
      }
    } catch (err) {
      message.error('Failed to update coming time');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateFinishing = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setUpdating(true);
    
    if (!selectedId) {
      setErrorMsg('Please select a user.');
      setUpdating(false);
      return;
    }
    if (!date) {
      setErrorMsg('Please select a date.');
      setUpdating(false);
      return;
    }
    if (!finishingTime) {
      setErrorMsg('Please enter finishing time.');
      setUpdating(false);
      return;
    }
    
    // Check if comingTime exists and is before finishingTime
    if (comingTime && finishingTime) {
      const [ch, cm] = comingTime.split(':').map(Number);
      const [fh, fm] = finishingTime.split(':').map(Number);
      const start = ch * 60 + cm;
      const end = fh * 60 + fm;
      if (end <= start) {
        setErrorMsg('Finishing time must be after coming time.');
        setUpdating(false);
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${selectedId}/duty`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date, finishingTime }),
      });
      const data = await res.json();
      if (res.ok) {
        message.success('Finishing time updated successfully!');
        // Refresh user details
        const userRes = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${selectedId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (userRes.ok) {
          setSelectedUser(userData);
          setAttendance(userData.attendance || []);
        }
      } else {
        message.error(data.message || 'Failed to update finishing time');
      }
    } catch (err) {
      message.error('Failed to update finishing time');
    } finally {
      setUpdating(false);
    }
  };

  const attendanceColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Coming Time', dataIndex: 'comingTime', key: 'comingTime' },
    { title: 'Finishing Time', dataIndex: 'finishingTime', key: 'finishingTime' },
  ];

  const handleQrScan = async (scannedText) => {
    if (!scannedText) return;
    // Assume QR code contains the user profile link or just the user ID
    let userId = scannedText;
    // If QR code is a URL, extract the user ID
    const match = scannedText.match(/\/user\/([\w-]+)/);
    if (match) userId = match[1];
    setSelectedId(userId);
    // Fetch user details and auto-update coming/finishing time
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedUser(data);
        setAttendance(data.attendance || []);
        const today = dayjs().format('YYYY-MM-DD');
        const todayRecord = (data.attendance || []).find(a => a.date === today);
        if (!todayRecord || !todayRecord.comingTime) {
          // Auto-update coming time
          const now = dayjs().format('HH:mm');
          await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${userId}/duty`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ date: today, comingTime: now }),
          });
          setComingTime(now);
          message.success('Coming time updated automatically!');
        } else if (todayRecord.comingTime && !todayRecord.finishingTime) {
          // Auto-update finishing time
          const now = dayjs().format('HH:mm');
          await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${userId}/duty`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ date: today, finishingTime: now }),
          });
          setFinishingTime(now);
          message.success('Finishing time updated automatically!');
        } else {
          message.info('Today\'s duty already completed.');
        }
      } else {
        message.error(data.message || 'User not found');
      }
    } catch (err) {
      message.error('Failed to fetch user details');
    } finally {
      // setQrScanLoading(false); // Removed as per edit hint
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, padding: 24 }}>Scout</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['update-duty']}
          onClick={({ key }) => {
            if (key === 'view-all-users') navigate('/dashboard/super/view-all-users');
            if (key === 'overview') navigate('/dashboard/super');
            if (key === 'add') navigate('/dashboard/super/add-user');
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
        <Content style={{ margin: { xs: 12, md: 24 }, background: '#fff', borderRadius: 8, minHeight: 400, padding: { xs: 16, md: 24 } }}>
          <Title level={2} style={{ marginBottom: 24 }}>Update Duty Times</Title>
          
          <Card style={{ maxWidth: 600, margin: '0 auto', background: '#f7faff' }}>
            <Form layout="vertical">
              <Form.Item label="Select User *" required>
                <Select
                  value={selectedId}
                  onChange={setSelectedId}
                  placeholder="Select a user"
                  loading={loading}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={users.map(u => ({ value: u._id, label: `${u.name} (${u._id})` }))}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <Form.Item label="Select Date *" required>
                <DatePicker
                  value={date ? dayjs(date) : null}
                  onChange={d => setDate(d ? d.format('YYYY-MM-DD') : '')}
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  allowClear={false}
                  disabledDate={d => d && d.isAfter(dayjs(), 'day')}
                />
              </Form.Item>
              
              {selectedUser && (
                <Card size="small" style={{ marginBottom: 16, background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Avatar src={selectedUser.profilePic} size={48} icon={<UserOutlined />} />
                    <div>
                      <Title level={5} style={{ margin: 0, marginBottom: 4 }}>{selectedUser.name}</Title>
                      <Text type="secondary">{selectedUser.email}</Text>
                    </div>
                  </div>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Text strong>Phone:</Text> {selectedUser.phoneNumber}
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>NIC:</Text> {selectedUser.nic}
                    </Col>
                  </Row>
                </Card>
              )}
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Coming Time">
                    <Input
                      type="time"
                      value={comingTime}
                      onChange={e => setComingTime(e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <Button
                      type="primary"
                      onClick={handleUpdateComing}
                      loading={updating}
                      disabled={!selectedId || !date || !comingTime}
                      style={{ marginTop: 8, width: '100%' }}
                    >
                      Update Coming Time
                    </Button>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Finishing Time">
                    <Input
                      type="time"
                      value={finishingTime}
                      onChange={e => setFinishingTime(e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <Button
                      type="primary"
                      onClick={handleUpdateFinishing}
                      loading={updating}
                      disabled={!selectedId || !date || !finishingTime}
                      style={{ marginTop: 8, width: '100%' }}
                    >
                      Update Finishing Time
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
              
              {errorMsg && (
                <Alert
                  message="Error"
                  description={errorMsg}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
              {successMsg && (
                <Alert
                  message="Success"
                  description={successMsg}
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
            </Form>
          </Card>
          
          {/* Selected User Attendance Records */}
          {attendance && attendance.length > 0 && (
            <div style={{ maxWidth: 800, margin: '40px auto 0 auto' }}>
              <Title level={3} style={{ marginBottom: 16 }}>Selected User Attendance Records</Title>
              <Table 
                columns={attendanceColumns} 
                dataSource={attendance} 
                rowKey="date"
                scroll={{ x: 400 }}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
                  pageSizeOptions: ['10', '20', '50'],
                  responsive: true
                }}
                size="middle"
              />
            </div>
          )}
          <QrScanner onScan={handleQrScan} />
        </Content>
      </Layout>
    </Layout>
  );
}

function AttendanceHistory() {
  useSessionTimeout();
  const email = localStorage.getItem('adminEmail') || 'Admin';
  const navigate = useNavigate();
  const [users, setUsers] = React.useState([]);
  const [historyFilterDate, setHistoryFilterDate] = React.useState('');
  const [allAttendanceHistory, setAllAttendanceHistory] = React.useState([]);
  const [selectedUserFilter, setSelectedUserFilter] = React.useState('');

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data);
          // Prepare all attendance history
          const allHistory = [];
          data.forEach(user => {
            if (user.attendance && user.attendance.length > 0) {
              user.attendance.forEach(record => {
                allHistory.push({
                  ...record,
                  userId: user._id,
                  userName: user.name,
                  userEmail: user.email
                });
              });
            }
          });
          setAllAttendanceHistory(allHistory);
        }
      } catch {}
    }
    fetchUsers();
  }, []);

  const allAttendanceColumns = [
    { title: 'User ID', dataIndex: 'userId', key: 'userId' },
    { title: 'Name', dataIndex: 'userName', key: 'userName' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Coming Time', dataIndex: 'comingTime', key: 'comingTime' },
    { title: 'Finishing Time', dataIndex: 'finishingTime', key: 'finishingTime' },
    { 
      title: 'Duty Time', 
      key: 'dutyTime',
      render: (_, record) => {
        if (record.comingTime && record.finishingTime) {
          const start = dayjs(`${record.date} ${record.comingTime}`, "YYYY-MM-DD HH:mm");
          const end = dayjs(`${record.date} ${record.finishingTime}`, "YYYY-MM-DD HH:mm");
          if (start.isValid() && end.isValid()) {
            const minutes = end.diff(start, 'minute');
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
          }
        }
        return '-';
      }
    },
  ];

  // Filter attendance history by date and user
  const filteredHistory = allAttendanceHistory.filter(record => {
    const dateMatch = !historyFilterDate || record.date === historyFilterDate;
    const userMatch = !selectedUserFilter || record.userId === selectedUserFilter;
    return dateMatch && userMatch;
  });

  const isSuperAdmin = getAdminRole() === 'super';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, padding: 24 }}>Scout</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['attendance-history']}
          onClick={({ key }) => {
            if (isSuperAdmin) {
              if (key === 'overview') navigate('/dashboard/super');
              if (key === 'add') navigate('/dashboard/super/add-user');
              if (key === 'view-all-users') navigate('/dashboard/super/view-all-users');
              if (key === 'update-duty') navigate('/dashboard/super/update-duty');
              if (key === 'attendance-history') navigate('/dashboard/super/attendance-history');
            } else {
              if (key === 'overview') navigate('/dashboard/secondary');
              if (key === 'view-users') navigate('/dashboard/secondary/view-users');
              if (key === 'update') navigate('/dashboard/secondary/update-duty');
              if (key === 'attendance-history') navigate('/dashboard/secondary/attendance-history');
            }
          }}
          items={isSuperAdmin ? [
            { key: 'overview', label: 'Overview' },
            { key: 'add', label: 'Add New User' },
            { key: 'view-all-users', label: 'View All Users' },
            { key: 'update-duty', label: 'Update Duty Times' },
            { key: 'attendance-history', label: 'Attendance History' },
          ] : [
            { key: 'overview', label: 'Overview' },
            { key: 'view-users', label: 'View Users' },
            { key: 'update', label: 'Update Duty Times' },
            { key: 'attendance-history', label: 'Attendance History' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <b>{email}</b> <span style={{ color: '#1677ff', marginLeft: 8 }}>[{isSuperAdmin ? 'super' : 'secondary'}]</span>
          </div>
          <Button type="primary" danger onClick={logout}>Logout</Button>
        </Header>
        <Content style={{ margin: 24, background: '#fff', borderRadius: 8, minHeight: 400, padding: 24 }}>
          <h2>All Users Attendance History</h2>
          
          {/* Filters */}
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontWeight: 500 }}>Filter by Date:</label>
              <DatePicker
                value={historyFilterDate ? dayjs(historyFilterDate) : null}
                onChange={d => setHistoryFilterDate(d ? d.format('YYYY-MM-DD') : '')}
                style={{ width: 200 }}
                format="YYYY-MM-DD"
                allowClear={true}
                placeholder="Select date to filter"
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontWeight: 500 }}>Filter by User:</label>
              <select 
                value={selectedUserFilter} 
                onChange={e => setSelectedUserFilter(e.target.value)}
                style={{ width: 200, padding: 8, borderRadius: 4, border: '1px solid #d9d9d9' }}
              >
                <option value="">All Users</option>
                {users.map(u => <option key={u._id} value={u._id}>{u._id} - {u.name}</option>)}
              </select>
            </div>
            
            <Button 
              onClick={() => {
                setHistoryFilterDate('');
                setSelectedUserFilter('');
              }} 
              style={{ marginLeft: 8 }}
            >
              Clear All Filters
            </Button>
          </div>

          {/* Statistics and Export */}
          <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Card size="small" style={{ minWidth: 150 }}>
                <Statistic title="Total Records" value={filteredHistory.length} />
              </Card>
              <Card size="small" style={{ minWidth: 150 }}>
                <Statistic title="Total Users" value={users.length} />
              </Card>
              <Card size="small" style={{ minWidth: 150 }}>
                <Statistic 
                  title="Total Duty Time" 
                  value={(() => {
                    const totalMinutes = filteredHistory.reduce((total, record) => {
                      if (record.comingTime && record.finishingTime) {
                        const start = dayjs(`${record.date} ${record.comingTime}`, "YYYY-MM-DD HH:mm");
                        const end = dayjs(`${record.date} ${record.finishingTime}`, "YYYY-MM-DD HH:mm");
                        if (start.isValid() && end.isValid()) {
                          return total + end.diff(start, 'minute');
                        }
                      }
                      return total;
                    }, 0);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    return `${hours}h ${minutes}m`;
                  })()} 
                />
              </Card>
            </div>
            
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => {
                const csvContent = [
                  ['User ID', 'Name', 'Date', 'Coming Time', 'Finishing Time', 'Duty Time (Hours)', 'Duty Time (Minutes)'],
                  ...filteredHistory.map(record => {
                    let dutyTimeHours = 0;
                    let dutyTimeMinutes = 0;
                    if (record.comingTime && record.finishingTime) {
                      const start = dayjs(`${record.date} ${record.comingTime}`, "YYYY-MM-DD HH:mm");
                      const end = dayjs(`${record.date} ${record.finishingTime}`, "YYYY-MM-DD HH:mm");
                      if (start.isValid() && end.isValid()) {
                        const totalMinutes = end.diff(start, 'minute');
                        dutyTimeHours = Math.floor(totalMinutes / 60);
                        dutyTimeMinutes = totalMinutes % 60;
                      }
                    }
                    return [
                      record.userId,
                      record.userName,
                      record.date,
                      record.comingTime || '',
                      record.finishingTime || '',
                      dutyTimeHours,
                      dutyTimeMinutes
                    ];
                  })
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `attendance_history_${dayjs().format('YYYY-MM-DD_HH-mm')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Export to CSV
            </Button>
          </div>

          {/* Attendance Table */}
          <Table 
            columns={allAttendanceColumns} 
            dataSource={filteredHistory} 
            rowKey={(record) => `${record.userId}-${record.date}`} 
            pagination={{ 
              pageSize: 15, 
              showSizeChanger: true, 
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`
            }}
            loading={false}
            scroll={{ x: 800 }}
            size="middle"
          />
        </Content>
      </Layout>
    </Layout>
  );
}

// PrivateRoute for role-based protection
function PrivateRoute({ children, role }) {
  if (!isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }
  if (role && getAdminRole() !== role) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Login />} />
          <Route path="/dashboard/super" element={
            <PrivateRoute role="super">
              <SuperAdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/dashboard/super/add-user" element={
            <PrivateRoute role="super">
              <AddUserPage />
            </PrivateRoute>
          } />
          <Route path="/dashboard/super/view-all-users" element={
            <PrivateRoute role="super">
              <ViewAllUsers />
            </PrivateRoute>
          } />
          <Route path="/dashboard/super/update-duty" element={
            <PrivateRoute role="super">
              <SuperAdminUpdateDuty />
            </PrivateRoute>
          } />
          <Route path="/dashboard/super/attendance-history" element={
            <PrivateRoute role="super">
              <AttendanceHistory />
            </PrivateRoute>
          } />
          <Route path="/dashboard/secondary" element={
            <PrivateRoute role="secondary">
              <SecondaryAdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/dashboard/secondary/view-users" element={
            <PrivateRoute role="secondary">
              <SecondaryAdminViewUsers />
            </PrivateRoute>
          } />
          <Route path="/dashboard/secondary/update-duty" element={
            <PrivateRoute role="secondary">
              <SecondaryAdminUpdateDuty />
            </PrivateRoute>
          } />
          <Route path="/dashboard/secondary/attendance-history" element={
            <PrivateRoute role="secondary">
              <AttendanceHistory />
            </PrivateRoute>
          } />
          <Route path="/user/:userId" element={<UserStatusPage />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
