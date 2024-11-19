import { Modal, Form, Input, Select, Switch, Row, Col, Button } from 'antd';

const { Option } = Select;

const EditProjectModal = ({
  visible,
  onCancel,
  form,
  onFinish,
  groups,
  types,
  showSeriesFields,
  validateSeriesInput,
  customDarkText,
  t
}) => {
  return (
    <Modal
      title={t('editProject')}
      open={visible} // Changed from visible to open
      onCancel={onCancel}
      footer={null}
      width="95%"
      style={{ maxWidth: '600px' }}
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={24}>
            <Form.Item
              name="group"
              label={t('group')}
              rules={[{ required: true, message: t('pleaseSelectGroup') }]}
            >
              <Select placeholder={t('selectGroup')}>
                {groups.map((group) => (
                  <Option key={group.id} value={group.id}>{group.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24}>
            <Form.Item
              name="type"
              label={<span className={customDarkText}>{t('type')}</span>}
              rules={[{ required: true, message: t('pleaseSelectType') }]}
            >
              <Select placeholder={t('selectType')}>
                {types.map((type) => (
                  <Option key={type.typeId} value={type.typeId}>{type.types}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {showSeriesFields && (
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="numberOfSeries"
                label={<span className={customDarkText}>{t('numberOfSeries')}</span>}
                rules={[{ required: true, message: t('pleaseEnterNumberOfSeries') }]}
              >
                <Select placeholder={t('selectNumberOfSeries')}>
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <Option key={num} value={num}>{num}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="seriesName"
                label={<span className={customDarkText}>{t('seriesName')}</span>}
                rules={[
                  { required: true, message: t('pleaseEnterSeriesName') },
                  { validator: validateSeriesInput }
                ]}
              >
                <Input 
                  placeholder={t('enterSeriesName')}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>
          </Row>
        )}
        <Row gutter={[16, 0]}>
          <Col xs={24}>
            <Form.Item
              name="name"
              label={<span className={customDarkText}>{t('projectName')}</span>}
              rules={[{ required: true, message: t('pleaseEnterProjectName') }]}
            >
              <Input placeholder={t('enterProjectName')} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="description"
              label={<span className={customDarkText}>{t('description')}</span>}
            >
              <Input.TextArea rows={4} placeholder={t('enterDescription')} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="quantityThreshold"
              label={<span className={customDarkText}>{t('quantityThreshold')}</span>}
              tooltip={t('quantityThresholdTooltip')}
            >
              <Input type="number" min={0} placeholder={t('enterQuantityThreshold')} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="status"
              label={t('status')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end" gutter={[8, 0]}>
          <Col>
            <Button onClick={onCancel}>{t('cancel')}</Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              {t('save')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditProjectModal;
