"use client"

import { useState } from "react"
import { Form, Input, Button, Typography, Card, Row, Col, message, Layout, Space } from "antd"
import { SafetyOutlined, EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

const { Title, Paragraph, Text } = Typography
const { Header, Content, Footer } = Layout

const API_URL = process.env.REACT_APP_API_URL || ""

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    setErrorMsg("")
    try {
      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const result = await response.json()
      if (response.ok) {
        localStorage.setItem("token", result.token)
        localStorage.setItem("adminType", result.adminType || result.role)
        localStorage.setItem("adminId", result.adminId)
        message.success("Login successful! Redirecting...")
        setTimeout(() => {
          const role = result.adminType || result.role
          if (role === "super") {
            window.location.href = "/dashboard/super"
          } else {
            window.location.href = "/dashboard/secondary"
          }
        }, 1000)
      } else {
        setErrorMsg(result.message || "Login failed. Please try again.")
        message.error(result.message || "Login failed. Please try again.")
      }
    } catch (err) {
      setErrorMsg("Login failed. Please try again.")
      message.error("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      <Header
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "none",
          boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
          position: 'relative',
        }}
      >
        {/* Back Button */}
        <button
          className="back-btn-glass"
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 16,
            zIndex: 2,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00cec8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span style={{ color: '#00cec8' }}>Back</span>
        </button>
        <div
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: 'center',
          }}
        >
          <SafetyOutlined style={{ marginRight: 12, color: "#00cec8", fontSize: 28 }} />
          Scout Admin Portal
        </div>
      </Header>

      <Content
        style={{
          padding: "60px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Row justify="center" align="middle" style={{ width: "100%" }}>
          <Col xs={24} sm={20} md={14} lg={10} xl={8}>
            <div className="fade-in-up">
              <Card
                bordered={false}
                className="shadow-strong"
                style={{
                  borderRadius: 20,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #00cec8 0%, #006064 100%)",
                    margin: "-24px -24px 24px -24px",
                    padding: "32px 24px",
                    textAlign: "center",
                  }}
                >
                  <SafetyOutlined style={{ fontSize: 56, color: "#fff", marginBottom: 16 }} />
                  <Title level={2} style={{ color: "#fff", margin: 0 }}>
                    Admin Login
                  </Title>
                  <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>Welcome back! Please sign in to continue</Text>
                </div>

                {errorMsg && (
                  <Card
                    size="small"
                    style={{
                      marginBottom: 24,
                      background: "linear-gradient(135deg, #fff2f0 0%, #fff7f6 100%)",
                      border: "1px solid #ff4d4f",
                    }}
                  >
                    <Text type="danger" style={{ fontWeight: 500 }}>
                      ⚠️ {errorMsg}
                    </Text>
                  </Card>
                )}

                <Form layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
                  <Form.Item
                    label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>Email Address</span>}
                    name="email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Enter a valid email" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: "#00cec8" }} />}
                      placeholder="Enter your email address"
                      style={{
                        borderRadius: 10,
                        height: 48,
                        fontSize: 16,
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>Password</span>}
                    name="password"
                    rules={[{ required: true, message: "Please enter your password" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#00cec8" }} />}
                      placeholder="Enter your password"
                      iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      style={{
                        borderRadius: 10,
                        height: 48,
                        fontSize: 16,
                      }}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: 52,
                      borderRadius: 10,
                      fontSize: 16,
                      fontWeight: 600,
                      marginTop: 24,
                      background: "linear-gradient(135deg, #00cec8 0%, #006064 100%)",
                      border: "none",
                      boxShadow: "0 4px 16px rgba(0, 131, 143, 0.3)",
                    }}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </Form>

                <div
                  style={{
                    marginTop: 32,
                    textAlign: "center",
                    padding: "20px 0",
                    borderTop: "1px solid rgba(0, 131, 143, 0.1)",
                  }}
                >
                  <Space direction="vertical" size="small">
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      &copy; {new Date().getFullYear()} Scout Admin Portal. All rights reserved.
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      For support, contact admin@scoutportal.com
                    </Text>
                  </Space>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          color: "rgba(255, 255, 255, 0.8)",
          border: "none",
        }}
      >
        <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
          Scout Duty Management — Empowering Admins, Supporting Scouts
        </Text>
      </Footer>
    </Layout>
  )
}
