import React from 'react';
import { Layout, Typography, Button, Row, Col, Card, Steps, Space } from 'antd';
import { SafetyOutlined, UserOutlined, TeamOutlined, ClockCircleOutlined, QrcodeOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const steps = [
  {
    title: 'Admin Login',
    icon: <SafetyOutlined style={{ color: '#1677ff' }} />,
    description: 'Both admin roles log in from one page.'
  },
  {
    title: 'User Management',
    icon: <UserOutlined style={{ color: '#faad14' }} />,
    description: 'Super Admin adds/deletes users, Secondary Admin updates duty times.'
  },
  {
    title: 'Duty Time Tracking',
    icon: <ClockCircleOutlined style={{ color: '#52c41a' }} />,
    description: 'Admins manually set duty times; changes reflected live.'
  },
  {
    title: 'QR Status',
    icon: <QrcodeOutlined style={{ color: '#eb2f96' }} />,
    description: 'Users scan their QR code to view status/duty summary.'
  },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#001529', padding: 0, position: 'relative' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 24, paddingLeft: 24 }}>
          Scout
        </div>
        <LockOutlined style={{ position: 'absolute', right: 32, top: 18, color: '#fff', fontSize: 22, cursor: 'pointer' }} onClick={() => navigate('/admin')} />
      </Header>
      <Content style={{ padding: '0 0 40px 0' }}>
        <div style={{ background: 'linear-gradient(90deg, #1677ff 0%, #69c0ff 100%)', padding: '48px 0 32px 0' }}>
          <Row justify="center" align="middle" gutter={[0, 32]}>
            <Col xs={24} md={12} style={{ textAlign: 'center' }}>
              <Title style={{ color: '#fff', fontWeight: 800, fontSize: 36, marginBottom: 16 }}>Scout Duty Management</Title>
              <Paragraph style={{ color: '#e6f7ff', fontSize: 18, marginBottom: 32 }}>
                A platform for admins to manage users and their duty times. Users can view their status using their QR code.
              </Paragraph>
              <Space direction="vertical" size="middle">
                <Button type="primary" size="large" style={{ minWidth: 140 }} onClick={() => navigate('/admin')}>Admin Login</Button>
              </Space>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'center' }}>
              <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="Scouts in forest" style={{ width: '100%', maxWidth: 400, borderRadius: 16, objectFit: 'cover', boxShadow: '0 4px 24px #1677ff33' }} />
            </Col>
          </Row>
        </div>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 16px 24px 16px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>How It Works</Title>
          <Steps
            direction="horizontal"
            responsive
            current={-1}
            style={{ maxWidth: 700, margin: '0 auto' }}
            items={steps.map(step => ({
              title: <span style={{ fontSize: 20 }}>{step.icon} {step.title}</span>,
              description: <div style={{ fontSize: 16, marginTop: 8 }}>{step.description}</div>
            }))}
          />
        </div>
        <div style={{ background: 'linear-gradient(90deg, #1677ff 0%, #69c0ff 100%)', padding: '48px 0' }}>
          <Row justify="center">
            <Col xs={24} md={16} style={{ textAlign: 'center' }}>
              <Title style={{ color: '#fff', fontWeight: 700, marginBottom: 16 }}>Ready to manage your team?</Title>
              <Paragraph style={{ color: '#e6f7ff', fontSize: 18, marginBottom: 32 }}>
                Log in as an admin to add users, update duty times, and let users check their status with a QR code.
              </Paragraph>
              <Button type="primary" size="large" style={{ minWidth: 160 }} onClick={() => navigate('/admin')}>Admin Login</Button>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        &copy; 2025 Scout. All rights reserved.
      </Footer>
    </Layout>
  );
} 