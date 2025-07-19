"use client"

import { useState } from "react"
import { uploadToCloudinary } from "../utils/cloudinary"
import { Select, Card, Row, Col, Input, Button, Upload, message, Form, DatePicker, Avatar } from "antd"
import { UserOutlined, UploadOutlined, SaveOutlined } from "@ant-design/icons"
import dayjs from "dayjs"

const { Option } = Select

export default function AddUserForm({ onUserAdded }) {
  const [form] = Form.useForm()
  const [profilePic, setProfilePic] = useState(null)
  const [loading, setLoading] = useState(false)
  const [assignedId, setAssignedId] = useState("")
  const [age, setAge] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")

  const handleDateChange = (date) => {
    if (date) {
      const today = dayjs()
      let calculatedAge = today.year() - date.year()
      const monthDiff = today.month() - date.month()
      if (monthDiff < 0 || (monthDiff === 0 && today.date() < date.date())) {
        calculatedAge--
      }
      setAge(calculatedAge > 0 ? calculatedAge : "")
    } else {
      setAge("")
    }
  }

  const handleFileChange = (info) => {
    const file = info.file.originFileObj || info.file
    if (file) {
      setProfilePic(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      let profilePicUrl = ""
      if (profilePic) {
        profilePicUrl = await uploadToCloudinary(profilePic)
      }

      const formData = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : "",
        profilePic: profilePicUrl,
      }

      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (res.ok) {
        message.success("User added successfully!")
        setAssignedId(data.user._id)
        form.resetFields()
        setAge("")
        setProfilePic(null)
        setPreviewUrl("")
        if (onUserAdded) onUserAdded(data.user)
      } else {
        message.error(data.message || "Failed to add user")
      }
    } catch (err) {
      message.error("Failed to add user")
    } finally {
      setLoading(false)
    }
  }

  const schoolOptions = [
    "Christopher Sea Scouts (Open)",
    "District Rover Crew Jaffna",
    "J/Ariyalai Sri Parwathy Vidyalayam",
    "J/Canagaratnam MMV",
    "J/Chedditheru MMTM School",
    "J/Columbuththurai Hindu MV",
    "J/Delft Mankaiyatkarasi Vidyalayam",
    "J/Delft MV",
    "J/Delft RC Vidyalayam",
    "J/Delft Saivapiragasa Vidyalayam",
    "J/Delft Seekkiriyampallam GTMS",
    "J/Delft Sriskantha Vidyalayam",
    "J/Delft Subramaniyam Vidyalayam",
    "J/Hindu Ladies Primary School",
    "J/Jaffna Central College",
    "J/Jaffna Hindu College",
    "J/Jaffna Hindu Primary School",
    "J/Kalviyankadu HTMS",
    "J/Koddady Namasivaya Vid",
    "J/Kokuvil East Namakal Vidyalayam",
    "J/Kokuvil Hindu College",
    "J/Kokuvil Hindu Primary School",
    "J/Kokuvil Sthana CCTM School",
    "J/Kokuvil Sri Ramakrina Vidyasalai",
    "J/Kokuvil West CCTM School",
    "J/Kondavil CCTM School",
    "J/Kondavil Ramakrishna Vid",
    "J/Kondavil RCTM School",
    "J/Mavilithurai RCTM Vidyalayam",
    "J/Nallur Anipanthi MMV",
    "J/Nallur Kasipillai Vidalayam",
    "J/Nallur St Benedict RCV",
    "J/Osmania College",
    "J/Parameswara VID",
    "J/Passaioor St Antony's Girls Vid",
    "J/Poompukar GTMS",
    "J/St James Girls Maha Vidyalayam",
    "J/St James Maha Vidyalayam",
    "J/St John Bosco Vid",
    "J/St John's College",
    "J/St Patrick's College",
    "J/Thirunelvely RCTMS",
    "J/Urapulam MV",
    "J/Vaidyeshwara College",
    "J/Vannai Navalar MV",
  ].sort()

  return (
    <div className="fade-in-up">
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", color: "#1a1a2e" }}>
            <UserOutlined style={{ marginRight: 8, color: "#00cec8" }} />
            Add New User
          </div>
        }
        className="shadow-medium"
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
        }}
      >
        {assignedId && (
          <Card size="small" style={{ marginBottom: 24, background: "#e8f5e8" }}>
            <div style={{ textAlign: "center" }}>
              <strong style={{ color: "#52c41a" }}>✅ User Created Successfully!</strong>
              <br />
              <span style={{ color: "#1a1a2e" }}>Assigned ID: </span>
              <code style={{ background: "#fff", padding: "2px 8px", borderRadius: 4 }}>{assignedId}</code>
            </div>
          </Card>
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>Full Name</span>}
                name="name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input size="large" placeholder="Enter full name" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>Email Address</span>}
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input size="large" placeholder="Enter email address" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>Phone Number</span>}
                name="phoneNumber"
                rules={[{ required: true, message: "Please enter phone number" }]}
              >
                <Input size="large" placeholder="Enter phone number" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>NIC Number</span>}
                name="nic"
                rules={[{ required: true, message: "Please enter NIC number" }]}
              >
                <Input size="large" placeholder="Enter NIC number" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>Password</span>}
                name="password"
                rules={[{ required: true, message: "Please enter password" }]}
              >
                <Input.Password size="large" placeholder="Enter password" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>Date of Birth</span>}
                name="dateOfBirth"
                rules={[{ required: true, message: "Please select date of birth" }]}
              >
                <DatePicker
                  size="large"
                  style={{ width: "100%", borderRadius: 8 }}
                  onChange={handleDateChange}
                  placeholder="Select date of birth"
                />
              </Form.Item>
            </Col>

            {age && (
              <Col xs={24} md={12}>
                <Form.Item label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>Age</span>}>
                  <Input
                    size="large"
                    value={age}
                    readOnly
                    style={{
                      borderRadius: 8,
                      background: "#f8fffe",
                      color: "#00cec8",
                      fontWeight: 600,
                    }}
                  />
                </Form.Item>
              </Col>
            )}

            <Col xs={24}>
              <Form.Item
                label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>School</span>}
                name="school"
                rules={[{ required: true, message: "Please select school" }]}
              >
                <Select
                  showSearch
                  size="large"
                  placeholder="Select or search school"
                  style={{ borderRadius: 8 }}
                  filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {schoolOptions.map((school) => (
                    <Option key={school} value={school}>
                      {school}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label={<span style={{ color: "#1a1a2e", fontWeight: 500 }}>Profile Photo</span>}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Upload
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                    accept="image/*"
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />} size="large" style={{ borderRadius: 8 }}>
                      Choose Photo
                    </Button>
                  </Upload>
                  {previewUrl && <Avatar src={previewUrl} size={64} style={{ border: "3px solid #00cec8" }} />}
                </div>
                {profilePic && <div style={{ marginTop: 8, color: "#00cec8" }}>Selected: {profilePic.name}</div>}
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<SaveOutlined />}
              style={{
                minWidth: 200,
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {loading ? "Adding User..." : "Add User"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
