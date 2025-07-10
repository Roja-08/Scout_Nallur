import React, { useState } from 'react';
import { Card, Input, Button, message, Layout, Typography, Space, Avatar, Statistic, Row, Col } from 'antd';
import { LockOutlined, UserOutlined, EyeOutlined, TrophyTwoTone, CrownTwoTone, SmileTwoTone, LikeTwoTone } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Title, Text, Paragraph } = Typography;
const { Password } = Input;

export default function PasswordProtectedUserStatus() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      message.error('Please enter both User ID and Password');
      return;
    }

    setLoading(true);
    try {
      // First, get user info
      const userRes = await fetch(`/api/users/public/${userId}`);
      if (!userRes.ok) {
        message.error('User not found');
        setLoading(false);
        return;
      }
      const userData = await userRes.json();

      // Then authenticate with password
              const authRes = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/auth/user-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      if (!authRes.ok) {
        message.error('Invalid password');
        setLoading(false);
        return;
      }

      // Get leaderboard
              const leaderboardRes = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/public/leaderboard`);
      const leaderboardData = await leaderboardRes.json();

      setUser(userData);
      setLeaderboard(leaderboardData);
      setIsAuthenticated(true);
      message.success('Login successful!');
    } catch (error) {
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateLiveDutyTime = (user) => {
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
  };

  const formatDutyTime = (minutes) => {
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
  };

  const getCurrentStatus = (user) => {
    if (!user.attendance) return 'Inactive';
    const today = dayjs().format('YYYY-MM-DD');
    const todayRecord = user.attendance.find(a => a.date === today);
    
    if (!todayRecord) return 'Not Checked In Today';
    if (todayRecord.comingTime && !todayRecord.finishingTime) return 'Currently Working';
    if (todayRecord.comingTime && todayRecord.finishingTime) return 'Completed Today';
    return 'Inactive';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Currently Working': return '#52c41a';
      case 'Completed Today': return '#1890ff';
      case 'Not Checked In Today': return '#faad14';
      default: return '#d9d9d9';
    }
  };

  const trophyIcons = [
    <CrownTwoTone twoToneColor="#FFD700" style={{ fontSize: 24 }} />,
    <TrophyTwoTone twoToneColor="#C0C0C0" style={{ fontSize: 24 }} />,
    <TrophyTwoTone twoToneColor="#CD7F32" style={{ fontSize: 24 }} />,
  ];

  if (isAuthenticated && user) {
    const userDutyTime = calculateLiveDutyTime(user);
    const userRank = leaderboard.findIndex(u => u._id === user._id) + 1;
    const isTopLeader = userRank === 1;
    const currentStatus = getCurrentStatus(user);

    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
          <Card style={{ borderRadius: 12, marginBottom: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Title level={2} style={{ color: '#1890ff' }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Your Scout Status
              </Title>
            </div>

            {/* User Info */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic 
                    title="Current Status" 
                    value={currentStatus}
                    valueStyle={{ color: getStatusColor(currentStatus) }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic 
                    title="Total Duty Time" 
                    value={formatDutyTime(userDutyTime)}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic 
                    title="Your Rank" 
                    value={`#${userRank}`}
                    prefix={userRank <= 3 ? trophyIcons[userRank - 1] : <LikeTwoTone twoToneColor="#1677ff" />}
                  />
                </Card>
              </Col>
            </Row>

            {/* User Profile */}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                {user.profilePic ? (
                  <Avatar src={user.profilePic} size={64} style={{ marginRight: 16 }} />
                ) : (
                  <Avatar size={64} style={{ marginRight: 16, backgroundColor: '#1890ff' }}>
                    <UserOutlined style={{ fontSize: 32 }} />
                  </Avatar>
                )}
                <div>
                  <Title level={3} style={{ margin: 0 }}>{user.name}</Title>
                  <Text type="secondary">ID: {user._id}</Text>
                </div>
              </div>
              <Row gutter={[16, 8]}>
                <Col xs={24} md={12}>
                  <Text strong>Email:</Text> {user.email}
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Phone:</Text> {user.phoneNumber}
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>NIC:</Text> {user.nic}
                </Col>
              </Row>
            </Card>

            {/* Congratulations Message */}
            {isTopLeader && (
              <Card style={{ marginBottom: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                  <SmileTwoTone twoToneColor="#52c41a" style={{ fontSize: 32, marginBottom: 8 }} />
                  <Title level={4} style={{ color: 'white', margin: 0 }}>
                    🎉 Congratulations! You're the Top Leader! 🎉
                  </Title>
                  <Text style={{ color: 'white' }}>
                    Keep up the excellent work and continue to inspire others!
                  </Text>
                </div>
              </Card>
            )}

            {/* Leaderboard */}
            <Card title="🏆 Top 3 Leaders" style={{ marginBottom: 20 }}>
              {leaderboard.slice(0, 3).map((leader, idx) => (
                <div key={leader._id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 0',
                  borderBottom: idx < 2 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <span style={{ marginRight: 12 }}>
                    {idx < 3 ? trophyIcons[idx] : <LikeTwoTone twoToneColor="#1677ff" />}
                  </span>
                  <Avatar src={leader.profilePic} size={32} style={{ marginRight: 12 }} />
                  <div style={{ flex: 1 }}>
                    <Text strong>{leader.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>ID: {leader._id}</Text>
                  </div>
                  <Text strong>{formatDutyTime(calculateLiveDutyTime(leader))}</Text>
                </div>
              ))}
            </Card>

            {/* Logout */}
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="primary" 
                onClick={() => {
                  setIsAuthenticated(false);
                  setUser(null);
                  setUserId('');
                  setPassword('');
                }}
              >
                Logout
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{ 
        maxWidth: 400, 
        margin: '50px auto', 
        padding: 20 
      }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <LockOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={2} style={{ color: '#1890ff' }}>
              Scout Status Access
            </Title>
            <Paragraph type="secondary">
              Enter your User ID and Password to view your status page
            </Paragraph>
          </div>

          <form onSubmit={handleLogin}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong>User ID</Text>
                <Input
                  size="large"
                  placeholder="Enter your User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  prefix={<UserOutlined />}
                />
              </div>

              <div>
                <Text strong>Password</Text>
                <Password
                  size="large"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  prefix={<LockOutlined />}
                />
              </div>

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                style={{ width: '100%' }}
                icon={<EyeOutlined />}
              >
                View My Status
              </Button>
            </Space>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Can't scan QR code? Use this form to access your status page directly.
            </Text>
          </div>
        </Card>
      </div>
    </Layout>
  );
} 