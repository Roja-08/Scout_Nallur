import React from 'react';
import { Layout, Typography, Button, Row, Col, Card, Space } from 'antd';
import { SafetyOutlined, UserOutlined, TeamOutlined, ClockCircleOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: 0 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 24, paddingLeft: 24 }}>
          <SafetyOutlined style={{ marginRight: 12, color: '#52c41a' }} />
          Scout Admin Portal
        </div>
      </Header>
      <Content style={{ padding: '40px 16px', background: '#f0f2f5' }}>
        <Row justify="center" align="middle" style={{ minHeight: '60vh' }}>
          <Col xs={24} md={12} style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title style={{ color: '#1677ff', fontWeight: 800, fontSize: 36, marginBottom: 16 }}>Scout Duty Management</Title>
            <Paragraph style={{ color: '#333', fontSize: 18, marginBottom: 32 }}>
              A platform for admins to manage users and their duty times. Users can view their status using their QR code.
            </Paragraph>
            <Space direction="vertical" size="middle">
              <Button type="primary" size="large" style={{ minWidth: 160 }} onClick={() => navigate('/login')}>
                Admin Login
              </Button>
            </Space>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'center' }}>
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={12}>
                <Card bordered={false} style={{ borderRadius: 12, minHeight: 140 }}>
                  <UserOutlined style={{ fontSize: 32, color: '#faad14' }} />
                  <Title level={4}>User Management</Title>
                  <Text>Super Admins can add & delete users. Secondary Admins can update duty times.</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card bordered={false} style={{ borderRadius: 12, minHeight: 140 }}>
                  <ClockCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  <Title level={4}>Duty Time Tracking</Title>
                  <Text>Admins update users' start and end times. All changes are tracked in real time.</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card bordered={false} style={{ borderRadius: 12, minHeight: 140 }}>
                  <QrcodeOutlined style={{ fontSize: 32, color: '#eb2f96' }} />
                  <Title level={4}>User QR Code</Title>
                  <Text>Users scan their QR code to view their current status and duty time summary.</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card bordered={false} style={{ borderRadius: 12, minHeight: 140 }}>
                  <TeamOutlined style={{ fontSize: 32, color: '#1677ff' }} />
                  <Title level={4}>Team Collaboration</Title>
                  <Text>Admins work together to ensure accurate duty tracking and user management.</Text>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        <Text type="secondary">Scout Duty Management &mdash; Empowering Admins, Supporting Scouts</Text>
      </Footer>
    </Layout>
  );
} 