import React, { useState } from 'react';
import { Input, Button, Table, message } from 'antd';
import axios from 'axios';
import API from '../CustomHooks/MasterApiHooks/api';

const SecurityQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const addQuestion = async () => {
    if (newQuestion.trim() === '') {
      message.error('Please enter a question.');
      return;
    }

    setLoading(true);

    try {
      // Post the new question to the backend API
      const response = await API.post('/SecurityQuestions', { question: newQuestion });

      if (response.status === 200) {
        const newEntry = {
          key: questions.length + 1,
          sr: questions.length + 1,
          question: newQuestion,
        };
        setQuestions([...questions, newEntry]);
        setNewQuestion('');
        message.success('Question added successfully!');
      } else {
        message.error('Failed to add the question.');
      }
    } catch (error) {
      message.error('An error occurred while adding the question.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Sr.',
      dataIndex: 'sr',
      key: 'sr',
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
  ];

  return (
    <div>
      <Input
        placeholder="Enter your security question"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
        style={{ width: '300px', marginRight: '10px' }}
        disabled={loading}
      />
      <Button
        type="primary"
        onClick={addQuestion}
        loading={loading}
        disabled={newQuestion.trim() === '' || loading} 
      >
        Add Question
      </Button>

      <Table
        columns={columns}
        dataSource={questions}
        pagination={{ pageSize: 5 }}
        style={{ marginTop: '20px', width: '500px' }}
      />
    </div>
  );
};

export default SecurityQuestions;
