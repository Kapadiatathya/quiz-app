import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Container, Menu } from 'semantic-ui-react';

import Stats from './Stats';
import QNA from './QNA';
import { calculateScore, calculateGrade, timeConverter } from '../../utils';

const Result = ({
  totalQuestions,
  correctAnswers,
  timeTaken,
  questionsAndAnswers,
  replayQuiz,
  resetQuiz,
}) => {
  const [activeTab, setActiveTab] = useState('Stats');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      const sendResultToAPI = async () => {
        const email = localStorage.getItem('userEmail');
        if (!email) return;
      
        const score = calculateScore(totalQuestions, correctAnswers);
        const { grade } = calculateGrade(score);
        const { hours, minutes, seconds } = timeConverter(timeTaken);
      
        const formattedTimeTaken = `${Number(hours)}h ${Number(minutes)}m ${Number(seconds)}s`;
      
        const currentDate = new Date();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
      
        try {
          const data = {
            email,
            totalQuestions,
            correctAnswers,
            timeTaken: formattedTimeTaken,
            grade,
            date: formattedDate,
            questionsAndAnswers
          };
      
          const response = await fetch('https://crtt4x062f.execute-api.us-east-1.amazonaws.com/prod/storeData', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
      
          const result = await response.json();
          console.log('API Response:', result);
        } catch (error) {
          console.error('Error sending result to API:', error);
        }
      };

      sendResultToAPI();
    }
  }, [totalQuestions, correctAnswers, timeTaken, questionsAndAnswers]);

  const handleTabClick = (e, { name }) => {
    setActiveTab(name);
  };

  return (
    <Container>
      <Menu fluid widths={2}>
        <Menu.Item
          name="Stats"
          active={activeTab === 'Stats'}
          onClick={handleTabClick}
        />
        <Menu.Item
          name="QNA"
          active={activeTab === 'QNA'}
          onClick={handleTabClick}
        />
      </Menu>
      {activeTab === 'Stats' && (
        <Stats
          totalQuestions={totalQuestions}
          correctAnswers={correctAnswers}
          timeTaken={timeTaken}
          replayQuiz={replayQuiz}
          resetQuiz={resetQuiz}
        />
      )}
      {activeTab === 'QNA' && <QNA questionsAndAnswers={questionsAndAnswers} />}
      <br />
    </Container>
  );
};

Result.propTypes = {
  totalQuestions: PropTypes.number.isRequired,
  correctAnswers: PropTypes.number.isRequired,
  timeTaken: PropTypes.number.isRequired,
  questionsAndAnswers: PropTypes.array.isRequired,
  replayQuiz: PropTypes.func.isRequired,
  resetQuiz: PropTypes.func.isRequired,
};

export default Result;
