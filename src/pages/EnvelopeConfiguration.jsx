import React, { useState } from 'react';
import { Form, Input, Button, Switch, message, Divider, Typography, Card, Row, Col } from 'antd';

const { TextArea } = Input;
const { Title } = Typography;

const EnvelopeConfiguration = () => {
  const [innerEnvelopeConfig, setInnerEnvelopeConfig] = useState({
    innerEnvelope: false,
    innerQuantity: '',
    innerRemarks: '',
    innerActive: true,
  });

  const [outerEnvelopeConfig, setOuterEnvelopeConfig] = useState({
    outerQuantity: '',
    outerRemarks: '',
    outerActive: true,
  });

  const handleInnerEnvelopeChange = (value) => {
    setInnerEnvelopeConfig({ ...innerEnvelopeConfig, innerEnvelope: value });
  };

  const handleInnerQuantityChange = (e) => {
    setInnerEnvelopeConfig({ ...innerEnvelopeConfig, innerQuantity: e.target.value });
  };

  const handleInnerRemarksChange = (e) => {
    setInnerEnvelopeConfig({ ...innerEnvelopeConfig, innerRemarks: e.target.value });
  };

  const handleInnerActiveChange = (value) => {
    setInnerEnvelopeConfig({ ...innerEnvelopeConfig, innerActive: value });
  };

  const handleOuterQuantityChange = (e) => {
    setOuterEnvelopeConfig({ ...outerEnvelopeConfig, outerQuantity: e.target.value });
  };

  const handleOuterRemarksChange = (e) => {
    setOuterEnvelopeConfig({ ...outerEnvelopeConfig, outerRemarks: e.target.value });
  };

  const handleOuterActiveChange = (value) => {
    setOuterEnvelopeConfig({ ...outerEnvelopeConfig, outerActive: value });
  };

  const handleSubmit = () => {
    // Validate the inputs before submission
    if (innerEnvelopeConfig.innerEnvelope && !innerEnvelopeConfig.innerQuantity) {
      message.error('Please specify the inner envelope configuration!');
      return;
    }

    if (!outerEnvelopeConfig.outerQuantity) {
      message.error('Please specify the outer envelope quantity!');
      return;
    }

    // Process the data as needed (e.g., send it to an API or save it)
    console.log('Inner Envelope Config:', innerEnvelopeConfig);
    console.log('Outer Envelope Config:', outerEnvelopeConfig);

    message.success('Envelope configurations saved successfully!');
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: '8px', maxWidth: '800px', margin: 'auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Envelope Configuration</Title>

      <Row gutter={16}>
        <Col span={12}>
          <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
            <Divider orientation="left">Inner Envelope Configuration</Divider>

            <Form layout="vertical">
              <Form.Item label="Inner Craft Paper Envelope">
                <Switch checked={innerEnvelopeConfig.innerEnvelope} onChange={handleInnerEnvelopeChange} />
              </Form.Item>

              {innerEnvelopeConfig.innerEnvelope && (
                <>
                  <Form.Item label="Inner Envelope Configuration (e.g., 10, 50, 100)">
                    <Input value={innerEnvelopeConfig.innerQuantity} onChange={handleInnerQuantityChange} />
                  </Form.Item>

                  <Form.Item label="Notes/Remarks">
                    <TextArea value={innerEnvelopeConfig.innerRemarks} onChange={handleInnerRemarksChange} rows={4} />
                  </Form.Item>

                  <Form.Item label="Active/Archived">
                    <Switch checked={innerEnvelopeConfig.innerActive} onChange={handleInnerActiveChange} />
                    
                  </Form.Item>
                </>
              )}
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
            <Divider orientation="left">Outer Envelope Configuration</Divider>

            <Form layout="vertical">
              <Form.Item label="Quantity of Outer Envelope">
                <Input value={outerEnvelopeConfig.outerQuantity} onChange={handleOuterQuantityChange} />
              </Form.Item>

              <Form.Item label="Notes/Remarks">
                <TextArea value={outerEnvelopeConfig.outerRemarks} onChange={handleOuterRemarksChange} rows={4} />
              </Form.Item>

              <Form.Item label="Active/Archived">
                <Switch checked={outerEnvelopeConfig.outerActive} onChange={handleOuterActiveChange} />
              </Form.Item>

              <Form.Item>
                
              </Form.Item>
            </Form>
          
          </Card>
          <Button type="primary" onClick={handleSubmit} style={{ width: '50%' }}>
                  Save Configuration
                </Button>
        </Col>
      </Row>
    </div>
  );
};

export default EnvelopeConfiguration;
