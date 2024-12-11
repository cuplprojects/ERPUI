import { Form, Input, Select, Switch, Row, Col, Button } from 'antd';
import { Modal } from 'react-bootstrap';
import { BsInfoCircleFill } from "react-icons/bs";
import { Tooltip } from 'antd';
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
  t,
  customDark,
  customMid,
  customLight,
  customBtn,
  customLightText,
  customLightBorder,
  customDarkBorder,
  numberOfSeries,
  setNumberOfSeries,
  projectName,
  setProjectName,
  selectedGroup,
  selectedType
}) => {
  
  return (
    <Modal
      show={visible}
      onHide={onCancel}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header className={`${customDark} `}>
        <Modal.Title className={`${customLightText} `}>{t('editProject')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`${customLight} `}>
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
                  <Select 
                    placeholder={t('selectNumberOfSeries')}
                    onChange={(value) => setNumberOfSeries(value)}
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <Option key={num} value={num}>{num}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="seriesNames"
                  label={<span className={customDarkText}>{t('seriesName')}</span>}
                  rules={[
                    { required: true, message: t('pleaseEnterSeriesName') },
                    { validator: validateSeriesInput }
                  ]}
                >
                  <Input 
                    placeholder={t('ENTERSERIESNAME')}
                    maxLength={numberOfSeries}
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length > numberOfSeries) {
                        // Optionally handle the case where input exceeds limit
                      }
                    }}
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
                <Input 
                  placeholder={t('enterProjectName')}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={!selectedGroup || !selectedType}
                />
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
                label={<span className={customDarkText}>
                  {t('quantityThreshold')}
                  <Tooltip title={t('quantityThresholdTooltip')}>
                    <BsInfoCircleFill className='ms-2'/>
                  </Tooltip></span>}
                // tooltip={t('quantityThresholdTooltip')}
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
        </Form>
      </Modal.Body>
      <Modal.Footer className={`${customDark} `}>
        <Button onClick={onCancel}>{t('cancel')}</Button>
        <Button type="primary" onClick={form.submit}>
          {t('save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProjectModal;
