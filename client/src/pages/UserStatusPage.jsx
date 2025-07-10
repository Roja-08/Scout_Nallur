import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spin, Typography, Avatar, Row, Col, Descriptions, Alert, List, Tag, Button, Divider, message } from 'antd';
import { TrophyTwoTone, CrownTwoTone, SmileTwoTone, ClockCircleOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

export default function UserStatusPage() {
  const { userId } = useParams();
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

  const totalDutyTime = calculateTotalDutyTime(user.attendance, userId);
  const workingStatus = getWorkingStatus(user.attendance);
  const userIsTopLeader = isTopLeader(userId, topLeaders);
  const isActive = isUserActiveToday(user.attendance);
  const trophyIcons = [
    <CrownTwoTone twoToneColor="#FFD700" style={{ fontSize: 20 }} />, // Gold
    <TrophyTwoTone twoToneColor="#C0C0C0" style={{ fontSize: 20 }} />, // Silver
    <TrophyTwoTone twoToneColor="#CD7F32" style={{ fontSize: 20 }} />, // Bronze
  ];

  return (
    <Row justify="center" style={{ marginTop: 40, marginBottom: 40 }}>
      <Col xs={24} md={20} lg={16}>
        {/* User Profile Card */}
        <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 2px 12px #e6f7ff', marginBottom: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar src={user.profilePic} size={96} style={{ marginBottom: 16 }} />
            <Title level={3}>{user.name}</Title>
            {userIsTopLeader && (
              <div style={{ marginBottom: 16, textAlign: 'center', fontWeight: 600, fontSize: 18, color: '#52c41a' }}>
                <SmileTwoTone twoToneColor="#52c41a" style={{ fontSize: 28, marginRight: 8 }} />
                🏆 Congratulations! You are the top leader!
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <Tag color={workingStatus.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                {workingStatus.status}
                {isActive && <span style={{ marginLeft: 6 }}>⏱️ Live</span>}
              </Tag>
            </div>
            <Paragraph style={{ fontSize: 18, margin: 0 }}>
              Total Duty Time: <b style={{ color: '#1677ff' }}>{formatDutyTime(totalDutyTime)}</b>
              {isActive && <span style={{ color: '#52c41a', fontSize: 14, marginLeft: 8 }}>↻ Live</span>}
            </Paragraph>
          </div>
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="ID">{user._id}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Phone Number">{user.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label="NIC">{user.nic}</Descriptions.Item>
            <Descriptions.Item label="Registration Time">{new Date(user.registrationTime).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Top 3 Leaders Card */}
        <Card 
          title={
            <span>
              <SmileTwoTone twoToneColor="#52c41a" style={{ marginRight: 8 }} />
              Top 3 Leadership Services
            </span>
          } 
          bordered={false} 
          style={{ borderRadius: 16, boxShadow: '0 2px 12px #e6f7ff' }}
        >
          {topLeaders.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={topLeaders}
              renderItem={(leader, idx) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <span>
                        {idx < 3 ? trophyIcons[idx] : <TrophyTwoTone twoToneColor="#1677ff" style={{ fontSize: 18 }} />}
                        <Avatar src={leader.profilePic} style={{ marginLeft: 6 }} />
                      </span>
                    }
                    title={
                      <span>
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
        <Divider orientation="left">Alternative Access Method</Divider>
        <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 2px 12px #e6f7ff' }}>
          <div style={{ textAlign: 'center' }}>
            <LockOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
            <Title level={4}>Can't Scan QR Code?</Title>
            <Paragraph>
              Use this direct link to access your status page:
            </Paragraph>
            <div style={{ 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: 8, 
              padding: 16, 
              margin: '16px 0',
              wordBreak: 'break-all'
            }}>
              <Text code style={{ fontSize: 14 }}>
                {`${window.location.origin}/user/${user._id}`}
              </Text>
            </div>
            <Button 
              type="primary" 
              size="large"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/user/${user._id}`);
                message.success('Link copied to clipboard!');
              }}
              icon={<LockOutlined />}
            >
              Copy Link
            </Button>
            <Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
              Simply share this link with anyone who needs to view your status page.
            </Paragraph>
          </div>
        </Card>
      </Col>
    </Row>
  );
} 