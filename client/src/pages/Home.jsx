"use client"
import { Layout, Typography, Button, Row, Col, Steps, Space, Card } from "antd"
import {
  SafetyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  QrcodeOutlined,
  LockOutlined,
  TrophyOutlined,
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text } = Typography

const steps = [
  {
    title: "Admin Login",
    icon: <SafetyOutlined style={{ color: "#00cec8" }} />,
    description: "Secure authentication for both admin roles with role-based access control.",
  },
  {
    title: "User Management",
    icon: <UserOutlined style={{ color: "#006064" }} />,
    description: "Super Admin manages users, Secondary Admin updates duty schedules efficiently.",
  },
  {
    title: "Duty Tracking",
    icon: <ClockCircleOutlined style={{ color: "#00cec8" }} />,
    description: "Real-time duty time tracking with live updates and comprehensive reporting.",
  },
  {
    title: "QR Access",
    icon: <QrcodeOutlined style={{ color: "#006064" }} />,
    description: "Users access their status instantly via QR code scanning or direct links.",
  },
]

const features = [
  {
    icon: <UserOutlined style={{ fontSize: 32, color: "#00cec8" }} />,
    title: "User Management",
    description:
      "Comprehensive user management with profile photos, school selection, and detailed information tracking.",
  },
  {
    icon: <ClockCircleOutlined style={{ fontSize: 32, color: "#006064" }} />,
    title: "Duty Time Tracking",
    description: "Precise duty time tracking with multiple schedule options and real-time calculations.",
  },
  {
    icon: <QrcodeOutlined style={{ fontSize: 32, color: "#00cec8" }} />,
    title: "QR Code Access",
    description: "Instant status access through QR codes with leaderboard and performance metrics.",
  },
  {
    icon: <TrophyOutlined style={{ fontSize: 32, color: "#006064" }} />,
    title: "Leaderboard System",
    description: "Motivational leaderboard system to recognize top performers and encourage participation.",
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fffe 0%, #ffffff 100%)",
      }}
    >
      <Header
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
          position: "relative",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <SafetyOutlined style={{ marginRight: 12, color: "#00cec8", fontSize: 28 }} />
            Scout Management System
          </div>
          <LockOutlined
            style={{
              color: "#00cec8",
              fontSize: 24,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/admin")}
            onMouseEnter={(e) => (e.target.style.color = "#fff")}
            onMouseLeave={(e) => (e.target.style.color = "#00cec8")}
          />
        </div>
      </Header>

      <Content style={{ padding: 0 }}>
        {/* Hero Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            padding: "80px 20px",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <div className="fade-in-up" style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ marginBottom: 40 }}>
              <img
                src={process.env.PUBLIC_URL + "/IMG-20230930-WA0000-removebg-preview.png" || "/placeholder.svg"}
                alt="Scout Logo"
                style={{
                  width: 120,
                  height: 120,
                  marginBottom: 24,
                  filter: "drop-shadow(0 4px 16px rgba(0, 131, 143, 0.3))",
                }}
              />
            </div>

            <Title
              level={1}
              style={{
                color: "#fff",
                fontSize: 48,
                fontWeight: 800,
                marginBottom: 24,
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              }}
            >
              Scout Duty Management
            </Title>

            <Paragraph
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 20,
                marginBottom: 40,
                maxWidth: 600,
                margin: "0 auto 40px auto",
              }}
            >
              Modern, efficient, and user-friendly platform for managing scout duties, tracking attendance, and
              recognizing outstanding service.
            </Paragraph>

            <Space size="large">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/admin")}
                style={{
                  height: 56,
                  padding: "0 32px",
                  fontSize: 18,
                  fontWeight: 600,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #00cec8 0%, #006064 100%)",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(0, 131, 143, 0.4)",
                }}
              >
                Admin Login
              </Button>
              <Button
                size="large"
                onClick={() => navigate("/user-status")}
                style={{
                  height: 56,
                  padding: "0 32px",
                  fontSize: 18,
                  fontWeight: 600,
                  borderRadius: 12,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  color: "#fff",
                }}
              >
                View Status
              </Button>
            </Space>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ padding: "80px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Title level={2} style={{ color: "#1a1a2e", marginBottom: 16 }}>
                Powerful Features
              </Title>
              <Paragraph style={{ color: "#666", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
                Everything you need to manage scout duties efficiently and effectively
              </Paragraph>
            </div>

            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col xs={24} md={12} lg={6} key={index}>
                  <Card
                    className="shadow-soft fade-in-up"
                    style={{
                      height: "100%",
                      textAlign: "center",
                      border: "1px solid rgba(0, 131, 143, 0.1)",
                      borderRadius: 16,
                      transition: "all 0.3s ease",
                    }}
                    bodyStyle={{ padding: 32 }}
                    hoverable
                  >
                    <div style={{ marginBottom: 20 }}>{feature.icon}</div>
                    <Title level={4} style={{ color: "#1a1a2e", marginBottom: 12 }}>
                      {feature.title}
                    </Title>
                    <Text style={{ color: "#666", lineHeight: 1.6 }}>{feature.description}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* How It Works Section */}
        <div
          style={{
            padding: "80px 20px",
            background: "linear-gradient(135deg, #f8fffe 0%, #ffffff 100%)",
          }}
        >
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Title level={2} style={{ color: "#1a1a2e", marginBottom: 16 }}>
                How It Works
              </Title>
              <Paragraph style={{ color: "#666", fontSize: 18 }}>
                Simple, streamlined process for maximum efficiency
              </Paragraph>
            </div>

            <Steps
              direction="horizontal"
              responsive
              current={-1}
              items={steps.map((step, index) => ({
                title: (
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    {step.icon} {step.title}
                  </span>
                ),
                description: (
                  <div
                    style={{
                      fontSize: 14,
                      marginTop: 8,
                      color: "#666",
                      lineHeight: 1.5,
                    }}
                  >
                    {step.description}
                  </div>
                ),
              }))}
            />
          </div>
        </div>

        {/* CTA Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #00cec8 0%, #006064 100%)",
            padding: "80px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Title
              level={2}
              style={{
                color: "#fff",
                fontWeight: 700,
                marginBottom: 24,
                fontSize: 36,
              }}
            >
              Ready to Get Started?
            </Title>
            <Paragraph
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 18,
                marginBottom: 40,
                lineHeight: 1.6,
              }}
            >
              Join the modern way of managing scout duties. Streamline your operations, track performance, and recognize
              outstanding service with our comprehensive platform.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/admin")}
              style={{
                height: 56,
                padding: "0 40px",
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 12,
                background: "#fff",
                color: "#00cec8",
                border: "none",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
            >
              Access Admin Portal
            </Button>
          </div>
        </div>
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "#1a1a2e",
          color: "rgba(255, 255, 255, 0.8)",
          padding: "40px 20px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 16 }}>
            Scout Duty Management — Empowering Admins, Supporting Scouts
          </Text>
          <br />
          <Text style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 14 }}>
            &copy; {new Date().getFullYear()} All rights reserved.
          </Text>
        </div>
      </Footer>
    </Layout>
  )
}
