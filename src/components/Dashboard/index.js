import React, { useState, useEffect } from 'react';
import { Container, Header, Loader, Accordion, Icon, Table, List } from 'semantic-ui-react';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
          throw new Error('No email found in localStorage');
        }

        const response = await fetch('https://gi8nfyqcwh.execute-api.us-east-1.amazonaws.com/getuserdata/stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const sortedData = result.sort((a, b) => new Date(b.stats.timestamp) - new Date(a.stats.timestamp));
        setData(sortedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const renderQuizDetails = (item) => (
    <div>
      <Header as='h4'>Quiz Statistics</Header>
      <Table celled>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Date</Table.Cell>
            <Table.Cell>{item.stats.date || 'N/A'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Grade</Table.Cell>
            <Table.Cell>{item.stats.grade || 'N/A'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Time Taken</Table.Cell>
            <Table.Cell>{item.stats.timeTaken || 'N/A'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Total Questions</Table.Cell>
            <Table.Cell>{item.stats.totalQuestions || 'N/A'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Correct Answers</Table.Cell>
            <Table.Cell>{item.stats.correctAnswers || 'N/A'}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      {item.qna.questionsAndAnswers && (
        <>
          <Header as='h4'>Questions and Answers</Header>
          <List divided relaxed>
            {item.qna.questionsAndAnswers.map((qa, index) => (
              <List.Item key={index}>
                <List.Content>
                  <List.Header>Question {index + 1}</List.Header>
                  <List.Description>
                    <p><strong>Q:</strong> {qa.question}</p>
                    <p><strong>Your Answer:</strong> {qa.user_answer}</p>
                    <p><strong>Correct Answer:</strong> {qa.correct_answer}</p>
                    <p><strong>Points:</strong> {qa.point}</p>
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        </>
      )}
    </div>
  );

  const panels = data.map((item, index) => ({
    key: index,
    title: {
      content: <span><Icon name='dropdown' />{formatDate(item.stats.timestamp)}</span>,
    },
    content: {
      content: renderQuizDetails(item),
    },
  }));

  if (loading) {
    return <Loader active>Loading...</Loader>;
  }

  return (
    <Container>
      <Header as='h1'>Quiz Dashboard</Header>
      {data.length > 0 ? (
        <Accordion fluid styled panels={panels} />
      ) : (
        <p>No quiz data available.</p>
      )}
    </Container>
  );
};

export default Dashboard;