import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import API from '../CustomHooks/MasterApiHooks/api';
import themeStore from '../store/themeStore';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { message } from 'antd';

const SecurityQuestions = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText] = getCssClasses();

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await API.get('/SecurityQuestions');
      if (response.status === 200) {
        const formattedQuestions = response.data.map((item, index) => ({
          sr: index + 1,
          questionId: item.questionId,
          question: item.securityQuestions
        }));
        setQuestions(formattedQuestions);
      } else {
        toast.error(t('failedToFetchQuestions'));
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error(t('errorOccurredWhileFetchingQuestions'));
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    if (newQuestion.trim() === '') {
      toast.error(t('pleaseEnterQuestion'));
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/SecurityQuestions', { securityQuestions: newQuestion });

      if (response.status === 201) {
        message.success(t('questionAddedSuccessfully'));
        setNewQuestion('');
        await fetchQuestions(); // Refresh the list after adding
      } else {
        console.error('Unexpected response status:', response.status);
        toast.error(t('failedToAddQuestion'));
      }
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error(t('errorOccurredWhileAddingQuestion'));
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = [
    { 
      headerName: t('sr'), 
      field: 'sr', 
      width: 70, 
      cellStyle: { textAlign: 'center' } 
    },
   
    { 
      headerName: t('question'), 
      field: 'question', 
      flex: 1, 
      cellStyle: { textAlign: 'left' },
      sortable: true,
      filter: true
    }, { 
      headerName: t('questionId'), 
      field: 'questionId', 
      width: 120, 
      cellStyle: { textAlign: 'center' } 
    }
  ];

  const onFilterTextBoxChanged = useCallback((e) => {
    setSearchText(e.target.value);
    if (gridApi) {
      gridApi.setQuickFilter(e.target.value);
    }
  }, []);

  let gridApi;

  const onGridReady = (params) => {
    gridApi = params.api;
    gridApi.sizeColumnsToFit();
  };

  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col-12 col-md-6 mb-3 mb-md-0">
          <InputGroup className="w-100">
            <FormControl
              placeholder={t('searchQuestions')}
              value={searchText}
              onChange={onFilterTextBoxChanged}
            />
            <Button className={`${customBtn} ${customDark === "dark-dark" ? "border" : "border-0"}`} onClick={() => setSearchText('')}>
              {t('clear')}
            </Button>
          </InputGroup>
        </div>
        <div className="col-12 col-md-6">
          <Form className="d-flex flex-column flex-md-row">
            <FormControl
              type="text"
              placeholder={t('enterYourSecurityQuestion')}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="mb-2 mb-md-0 me-md-2"
              disabled={loading}
            />
            <Button
              onClick={addQuestion}
              disabled={newQuestion.trim() === '' || loading}
              className={`${customBtn} ${customDark === "dark-dark" ? "border" : "border-0"}`}
            >
              {loading ? t('adding') : t('addQuestion')}
            </Button>
          </Form>
        </div>
      </div>

      <div 
        className="ag-theme-alpine" 
        style={{ 
          height: '400px', 
          width: '100%', 
          marginTop: '20px' 
        }}
      >
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={questions}
            pagination={true}
            paginationPageSize={5}
            domLayout='autoHeight'
            onGridReady={onGridReady}
            rowStyle={{ borderRadius: '8px' }}
            quickFilterText={searchText}
            className="rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default SecurityQuestions;
