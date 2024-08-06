import json
import boto3
import logging
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
quiz_stats_table = dynamodb.Table('QuizStats')
quiz_qna_table = dynamodb.Table('QuizQNA')

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Extract data from the event
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        elif isinstance(body, dict):
            body = body
        else:
            raise ValueError("Unexpected body type")

        logger.info(f"Parsed body: {json.dumps(body)}")

        email = body.get('email')
        date = body.get('date')
        total_questions = body.get('totalQuestions')
        correct_answers = body.get('correctAnswers')
        time_taken = body.get('timeTaken')
        grade = body.get('grade')
        questions_and_answers = body.get('questionsAndAnswers')

        # Generate a timestamp for the sort key
        timestamp = datetime.now().isoformat()

        # Prepare data for QuizStats table
        quiz_stats_item = {
            'email': email,
            'timestamp': timestamp,
            'date': date,
            'totalQuestions': total_questions,
            'correctAnswers': correct_answers,
            'timeTaken': time_taken,
            'grade': grade,
        }

        # Prepare data for QuizQNA table
        quiz_qna_item = {
            'email': email,
            'timestamp': timestamp,
            'date': date,
            'questionsAndAnswers': questions_and_answers,
        }

        # Store data in QuizStats table
        quiz_stats_table.put_item(Item=quiz_stats_item)
        
        # Store data in QuizQNA table
        quiz_qna_table.put_item(Item=quiz_qna_item)
        
        return {
            'statusCode': 200,
            'body': json.dumps('Data stored successfully')
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error storing data: {str(e)}')
        }