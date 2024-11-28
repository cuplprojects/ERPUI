import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
const AddProjectModal = ({
  visible,
  onCancel,
  form,
  onFinish,
  groups,
  types,
  showSeriesFields,
  // validateSeriesInput,
  customDarkText,
  customDark,
  customMid,
  customLight,
  customBtn,
  customLightText,
  customLightBorder,
  customDarkBorder,
  t,
  handleGroupChange,
  handleTypeChange,
  numberOfSeries,
  setNumberOfSeries,
  projectName,
  setProjectName,
  selectedGroup,
  selectedType
}) => {
  const [status, setStatus] = useState(true);

  const handleSubmit = (event) => {
    event.preventDefault();
    form.setFieldsValue({
      name: projectName,
      group: selectedGroup?.id,
      type: selectedType?.typeId,
      status: status
    });
    form.validateFields().then(onFinish).catch((err) => console.log(err));
  };

  
  return (
    <Modal show={visible} onHide={onCancel} size="lg" centered className='rounded'>
      <Modal.Header closeButton={false} className={`${customDark} ${customLightText}`}>
        <Modal.Title>{t('addNewProject')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`${customLight}`}>
        <Form id="addProjectForm" onSubmit={handleSubmit} form={form}>
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group controlId="group">
                <Form.Label className={customDarkText}>{t('group')}
                  <span className='text-danger ms-2 fs-6'>*</span>
                </Form.Label>
                <Form.Select onChange={handleGroupChange} required>
                  <option value="">{t('selectGroup')}</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-danger">
                  {form.getFieldError('group')?.[0]}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group controlId="type">
                <Form.Label className={customDarkText}>{t('type')}
                  <span className='text-danger ms-2 fs-6'>*</span>
                </Form.Label>
                <Form.Select onChange={handleTypeChange} disabled={!selectedGroup} required>
                  <option value="">{t('selectType')}</option>
                  {types.map((type) => (
                    <option key={type.typeId} value={type.typeId}>
                      {type.types}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-danger">
                  {form.getFieldError('type')?.[0]}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          {showSeriesFields && (
            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group controlId="numberOfSeries">
                  <Form.Label className={customDarkText}>{t('numberOfSeries')}
                    <span className='text-danger ms-2 fs-6'>*</span>
                  </Form.Label>
                  <Form.Select onChange={(e) => setNumberOfSeries(e.target.value)} required>
                    <option value="">{t('selectNumberOfSeries')}</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-danger">
                    {form.getFieldError('numberOfSeries')?.[0]}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group controlId="seriesName">
                  <Form.Label className={customDarkText}>{t('seriesName')}
                    <span className='text-danger ms-2 fs-6'>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('ENTERSERIESNAME')}
                    maxLength={numberOfSeries}
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length > numberOfSeries) {
                        // Optionally handle the case where the input exceeds the limit
                      }
                    }}
                    required
                  />
                  <Form.Text className="text-danger">
                    {form.getFieldError('seriesName')?.[0]}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          )}
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group controlId="name">
                <Form.Label className={customDarkText}>{t('projectName')}
                  <span className='text-danger ms-2 fs-6'>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('enterProjectName')}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={!selectedGroup || !selectedType}
                  required
                />
                <Form.Text className="text-danger">
                  {form.getFieldError('name')?.[0]}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group controlId="description">
                <Form.Label className={customDarkText}>{t('description')}</Form.Label>
                <Form.Control as="textarea" rows={2} placeholder={t('enterDescription')} />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3 d-flex align-items-center">
            <Col xs={9}>
              <Form.Group controlId="quantityThreshold">
                <Form.Label className={customDarkText}>{t('quantityThreshold')}</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  placeholder={t('enterQuantityThreshold')}
                />
                <Form.Text className="text-danger">
                  {form.getFieldError('quantityThreshold')?.[0]}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col xs={3} className="mt-3 d-flex align-items-center">
              <Form.Group controlId="status" className={customDarkText}>
                <Form.Check 
                  type="switch" 
                  label={t('status')} 
                  checked={status}
                  className='fs-4'
                  onChange={(e) => {
                    setStatus(e.target.checked);
                    form.setFieldsValue({ status: e.target.checked });
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer className={`${customDark}`}>
        <Button variant="secondary" onClick={onCancel} className='custom-zoom-btn text-white'>
          {t('cancel')}
        </Button>
        <Button variant="primary" type="submit" form="addProjectForm" className={`${customLight} border-white ${customDarkText} custom-zoom-btn`}>
          {t('save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProjectModal;
