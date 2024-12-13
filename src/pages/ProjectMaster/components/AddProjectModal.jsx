import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { BsInfoCircleFill } from "react-icons/bs";
import { useState, useEffect } from 'react';
import { Tooltip, Spin } from 'antd';

const AddProjectModal = ({
  visible,
  onCancel,
  form,
  onFinish,
  groups,
  types,
  showSeriesFields,
  customDarkText,
  customDark,
  customLight,
  t,
  handleGroupChange,
  handleTypeChange,
  numberOfSeries,
  setNumberOfSeries,
  seriesNames,
  setSeriesNames,
  projectName,
  setProjectName,
  selectedGroup,
  selectedType,
  selectedProject
}) => {
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [thresholdValue, setThresholdValue] = useState(selectedProject?.quantityThreshold || 0);
  const [descriptionValue, setDescriptionValue] = useState(selectedProject?.description || '');
  useEffect(() => {
    if (selectedProject) {
      setNumberOfSeries(selectedProject.numberOfSeries);
      setSeriesNames(selectedProject.seriesNames);
      setThresholdValue(selectedProject.quantityThreshold);
      setDescriptionValue(selectedProject.description);
    }
  }, [selectedProject, setNumberOfSeries, setSeriesNames]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formValues = form.getFieldsValue();
    
    const projectData = {
      name: projectName,
      status: status,
      description: descriptionValue,
      groupId: selectedGroup?.id,
      typeId: selectedType?.typeId,
      noOfSeries: parseInt(numberOfSeries) || 0,
      seriesName: seriesNames || null,
      quantityThreshold: thresholdValue
    };
    
    setLoading(true);
    try {
      await form.validateFields();
      await onFinish(projectData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      show={visible} 
      onHide={onCancel} 
      size="lg" 
      centered 
      className='rounded'
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton={false} className={`${customDark}`}>
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
              {numberOfSeries > 1 && (
                <Col xs={6}>
                  <Form.Group controlId="seriesNames">
                    <Form.Label className={customDarkText}>{t('seriesNames')}
                      <span className='text-danger ms-2 fs-6'>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('ENTERSERIESNAME')}
                      maxLength={numberOfSeries}
                      style={{ textTransform: 'uppercase' }}
                      value={seriesNames}
                      onChange={(e) => setSeriesNames(e.target.value.toUpperCase())}
                      required
                    />
                    <Form.Text className="text-danger">
                      {form.getFieldError('seriesName')?.[0]}
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}
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
                <Form.Control
                  as="textarea"
                  name="description"
                  rows={2}
                  placeholder={t('enterDescription')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDescriptionValue(value);
                    form.setFieldsValue({ description: value });
                  }}
                  value={descriptionValue}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3 d-flex align-items-center">
            <Col xs={9}>
              <Form.Group controlId="quantityThreshold">
                <Form.Label className={customDarkText}>
                  {t('quantityThreshold')}
                  <Tooltip title={t('quantityThresholdTooltip')}>
                    <BsInfoCircleFill className='ms-2'/>
                  </Tooltip>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="quantityThreshold"
                  min={0}
                  placeholder={t('enterQuantityThreshold')}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : '';
                    setThresholdValue(value);
                    form.setFieldsValue({ quantityThreshold: value });
                  }}
                  value={thresholdValue}
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
        <Button 
          variant="secondary" 
          onClick={onCancel} 
          className='custom-zoom-btn text-white'
          disabled={loading}
        >
          {t('cancel')}
        </Button>
        <Button 
          variant="primary" 
          type="submit" 
          form="addProjectForm" 
          className={`${customLight} border-white ${customDarkText} custom-zoom-btn`}
          disabled={loading}
        >
          {loading ? <Spin size="small" /> : t('save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProjectModal;
