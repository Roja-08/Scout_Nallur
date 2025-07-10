import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Row, Col, message, Layout } from 'antd';
import { SafetyOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;

// Use environment variable for API URL, fallback to empty string for proxy
const API_URL = process.env.REACT_APP_API_URL || '';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Use API_URL for deployment, proxy for local dev
      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('adminType', result.adminType || result.role);
        localStorage.setItem('adminId', result.adminId);
        message.success('Login successful! Redirecting...');
        // Redirect based on admin type/role
        setTimeout(() => {
          const role = result.adminType || result.role;
          if (role === 'super') {
            window.location.href = '/dashboard/super';
          } else {
            window.location.href = '/dashboard/secondary';
          }
        }, 1000);
      } else {
        setErrorMsg(result.message || 'Login failed. Please try again.');
        message.error(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Login failed. Please try again.');
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <Col xs={24} sm={20} md={14} lg={10} xl={8}>
            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 2px 12px #e6f7ff' }}>
              {errorMsg && (
                <div style={{ color: 'red', marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <SafetyOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 8 }} />
                <Title level={3} style={{ marginBottom: 0 }}>Admin Login</Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  Welcome to the Scout Duty Management Portal.<br />
                  Please log in with your admin credentials to access your dashboard.
                </Paragraph>
              </div>
              <Form
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ email: '', password: '' }}
                autoComplete="off"
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Enter a valid email' }]}
                >
                  <Input size="large" placeholder="Enter your email" />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: 'Please enter your password' }]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Enter your password"
                    iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{ marginTop: 8 }}
                >
                  Login
                </Button>
              </Form>
              <div style={{ marginTop: 32, textAlign: 'center', color: '#888' }}>
                <Text type="secondary">
                  &copy; {new Date().getFullYear()} Scout Admin Portal. All rights reserved.<br />
                  <span style={{ fontSize: 12 }}>For support, contact admin@scoutportal.com</span>
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        <Text type="secondary">Scout Duty Management &mdash; Empowering Admins, Supporting Scouts</Text>
      </Footer>
    </Layout>
  );
} 