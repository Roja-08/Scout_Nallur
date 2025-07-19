import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Typography, Avatar, Row, Col, Descriptions, Alert, List, Tag, Button, Divider, message } from 'antd';
import { TrophyTwoTone, CrownTwoTone, SmileTwoTone, ClockCircleOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './UserStatusPage.css';

const { Title, Paragraph, Text } = Typography;

export default function UserStatusPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [topLeaders, setTopLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Update current time every minute for live duty time calculation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Debug: Log API URL
        console.log('API URL:', process.env.REACT_APP_API_URL);
        // Fetch user data
        const userRes = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/public/${userId}`);
        if (!userRes.ok) throw new Error('User not found');
        const userData = await userRes.json();
        setUser(userData);

        // Fetch all users for leaderboard
        const leadersRes = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/public/leaderboard`);
        if (leadersRes.ok) {
          const leadersData = await leadersRes.json();
          setTopLeaders(leadersData.slice(0, 3));
        } else {
          console.error('Failed to fetch leaderboard data');
        }
      } catch (err) {
        // Debug: Log error to browser console
        console.error('Error in UserStatusPage fetchData:', err);
        setError('User not found or server error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  // Calculate total duty time from attendance (including live time for active users)
  function calculateTotalDutyTime(attendance, userId = null) {
    if (!attendance) return 0;
    let total = 0;
    const today = dayjs().format('YYYY-MM-DD');
    
    attendance.forEach(a => {
      if (a.comingTime && a.finishingTime) {
        const start = dayjs(`${a.date} ${a.comingTime}`, "YYYY-MM-DD HH:mm");
        const end = dayjs(`${a.date} ${a.finishingTime}`, "YYYY-MM-DD HH:mm");
        if (start.isValid() && end.isValid()) {
          total += Math.max(0, end.diff(start, 'minute'));
        }
      } else if (a.comingTime && !a.finishingTime && a.date === today) {
        // Live calculation for active users today
        const start = dayjs(`${a.date} ${a.comingTime}`, "YYYY-MM-DD HH:mm");
        if (start.isValid()) {
          total += Math.max(0, currentTime.diff(start, 'minute'));
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

  // Check if user is active today
  function isUserActiveToday(attendance) {
    if (!attendance) return false;
    const today = dayjs().format('YYYY-MM-DD');
    const todayRecord = attendance.find(a => a.date === today);
    return todayRecord && todayRecord.comingTime && !todayRecord.finishingTime;
  }

  // Get working status
  function getWorkingStatus(attendance) {
    if (!attendance) return { status: 'Not Started', color: 'default' };
    
    const today = dayjs().format('YYYY-MM-DD');
    const todayRecord = attendance.find(a => a.date === today);
    
    if (!todayRecord) {
      return { status: 'Not Started Today', color: 'default' };
    }
    
    if (todayRecord.comingTime && !todayRecord.finishingTime) {
      return { status: 'Active', color: 'green' };
    }
    
    if (todayRecord.comingTime && todayRecord.finishingTime) {
      return { status: 'Completed Today', color: 'blue' };
    }
    
    return { status: 'Not Started', color: 'default' };
  }

  // Check if current user is the top leader
  function isTopLeader(userId, topLeaders) {
    if (topLeaders.length === 0) return false;
    return topLeaders[0]._id === userId;
  }

  if (loading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;
  if (error) return <Alert type="error" message={error} style={{ margin: 40 }} />;
  if (!user) return <Alert type="error" message="User not found or data missing." style={{ margin: 40 }} />;

  const totalDutyTime = calculateTotalDutyTime(user?.attendance || [], userId);
  const workingStatus = getWorkingStatus(user?.attendance || []);
  const userIsTopLeader = isTopLeader(userId, topLeaders);
  const isActive = isUserActiveToday(user?.attendance || []);
  const trophyIcons = [
    <CrownTwoTone twoToneColor="#FFD700" style={{ fontSize: 20 }} />, // Gold
    <TrophyTwoTone twoToneColor="#C0C0C0" style={{ fontSize: 20 }} />, // Silver
    <TrophyTwoTone twoToneColor="#CD7F32" style={{ fontSize: 20 }} />, // Bronze
  ];

  return (
    <div className="user-status-bg">
      <Row justify="center" style={{ marginTop: 40, marginBottom: 40 }}>
        <Col xs={24} md={20} lg={16}>
          {/* Back Button */}
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
            <button
              className="back-btn-glass"
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00cec8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              <span style={{ color: '#00cec8' }}>Back</span>
            </button>
          </div>
          {/* User Profile Card */}
          <Card bordered={false} className="glass-card user-profile-card" style={{ marginBottom: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className="avatar-glow">
                <Avatar src={user.profilePic} size={110} style={{ marginBottom: 16, border: '4px solid #fff' }} />
              </div>
              <Title level={2} style={{ fontWeight: 800, letterSpacing: 1 }}>{user.name}</Title>
              {userIsTopLeader && (
                <div style={{ marginBottom: 16, textAlign: 'center', fontWeight: 700, fontSize: 20, color: '#52c41a', animation: 'fadeIn 1s' }}>
                  <SmileTwoTone twoToneColor="#52c41a" style={{ fontSize: 32, marginRight: 8 }} />
                  🏆 Congratulations! You are the top leader!
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <Tag color={workingStatus.color} style={{ fontSize: 16, padding: '6px 18px', borderRadius: 20, background: '#f0fdfc', color: '#00cec8', fontWeight: 600, boxShadow: '0 2px 8px #00cec833' }}>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  {workingStatus.status}
                  {isActive && <span style={{ marginLeft: 8 }}>⏱️ Live</span>}
                </Tag>
              </div>
              <Paragraph style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>
                Total Duty Time: <b style={{ color: '#00cec8' }}>{formatDutyTime(totalDutyTime)}</b>
                {isActive && <span style={{ color: '#52c41a', fontSize: 16, marginLeft: 10 }}>↻ Live</span>}
              </Paragraph>
            </div>
            <Descriptions column={1} bordered size="middle" className="glass-desc">
              <Descriptions.Item label="ID">{user._id}</Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">{user.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="NIC">{user.nic}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="Age">{user.age || '-'}</Descriptions.Item>
              <Descriptions.Item label="School">{user.school || '-'}</Descriptions.Item>
              <Descriptions.Item label="Registration Time">{new Date(user.registrationTime).toLocaleString()}</Descriptions.Item>
            </Descriptions>
          </Card>
          {/* Top 3 Leaders Card */}
          <Card 
            title={
              <span style={{ fontWeight: 700, fontSize: 20 }}>
                <SmileTwoTone twoToneColor="#52c41a" style={{ marginRight: 8 }} />
                Top 3 Leadership Services
              </span>
            } 
            bordered={false} 
            className="glass-card"
          >
            {topLeaders.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={topLeaders}
                renderItem={(leader, idx) => (
                  <List.Item style={{ borderRadius: 12, margin: '8px 0', background: idx === 0 ? 'linear-gradient(90deg, #e0ffe7 0%, #f0fdfc 100%)' : '#fff', boxShadow: idx === 0 ? '0 2px 12px #b2f7ef' : 'none' }}>
                    <List.Item.Meta
                      avatar={
                        <span>
                          {idx < 3 ? trophyIcons[idx] : <TrophyTwoTone twoToneColor="#1677ff" style={{ fontSize: 18 }} />}
                          <Avatar src={leader.profilePic} style={{ marginLeft: 6, border: idx === 0 ? '2px solid #52c41a' : 'none' }} />
                        </span>
                      }
                      title={
                        <span style={{ fontWeight: 600 }}>
                          {leader.name} 
                          <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>({leader._id})</span>
                          {leader._id === userId && (
                            <Tag color="green" style={{ marginLeft: 8 }}>You</Tag>
                          )}
                        </span>
                      }
                      description={
                        <span>
                          Duty Time: <b>{formatDutyTime(calculateTotalDutyTime(leader.attendance, leader._id))}</b>
                          {idx === 0 && (
                            <span style={{ marginLeft: 12, color: '#52c41a' }}>
                              🏆 Outstanding Service!
                            </span>
                          )}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>
                <SmileTwoTone twoToneColor="#52c41a" style={{ fontSize: 48, marginBottom: 16 }} />
                <p>No leadership data available</p>
              </div>
            )}
          </Card>
          {/* Alternative Access Method */}
          <Divider orientation="left" style={{ fontWeight: 700, fontSize: 18, color: '#00cec8' }}>Alternative Access Method</Divider>
          <Card bordered={false} className="glass-card">
            <div style={{ textAlign: 'center' }}>
              <LockOutlined style={{ fontSize: 28, color: '#00cec8', marginBottom: 8 }} />
              <Title level={4} style={{ color: '#00cec8', fontWeight: 700 }}>Can't Scan QR Code?</Title>
              <Paragraph>
                Use this direct link to access your status page:
              </Paragraph>
              <div className="copy-link-box">
                <Text code style={{ fontSize: 16 }}>
                  {`${window.location.origin}/user/${user._id}`}
                </Text>
              </div>
              <Button 
                type="primary" 
                size="large"
                className="copy-link-btn"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/user/${user._id}`);
                  message.success('Link copied to clipboard!');
                }}
                icon={<LockOutlined />}
              >
                Copy Link
              </Button>
              <Paragraph type="secondary" style={{ marginTop: 16, fontSize: 13 }}>
                Simply share this link with anyone who needs to view your status page.
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
} 