import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import traceback

dynamodb = boto3.resource('dynamodb')
quiz_stats_table = dynamodb.Table('QuizStats')
quiz_qna_table = dynamodb.Table('QuizQNA')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    try:
        # Check if the input is wrapped by API Gateway
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event

        # Extract email from the body
        email = body.get('email')
        
        if not email:
            raise KeyError('email')

        print(f"Querying DynamoDB for email: {email}")

        # Query QuizStats table
        stats_response = quiz_stats_table.query(
            KeyConditionExpression=Key('email').eq(str(email))  # Ensure email is a string
        )
        print(f"QuizStats response: {json.dumps(stats_response, cls=DecimalEncoder)}")

        # Query QuizQNA table
        qna_response = quiz_qna_table.query(
            KeyConditionExpression=Key('email').eq(str(email))  # Ensure email is a string
        )
        print(f"QuizQNA response: {json.dumps(qna_response, cls=DecimalEncoder)}")

        # Combine and sort the results
        combined_results = stats_response['Items'] + qna_response['Items']
        combined_results.sort(key=lambda x: x['timestamp'], reverse=True)

        # Group results by timestamp
        grouped_results = {}
        for item in combined_results:
            timestamp = item['timestamp']
            if timestamp not in grouped_results:
                grouped_results[timestamp] = {'stats': None, 'qna': None}
            
            if 'totalQuestions' in item:
                grouped_results[timestamp]['stats'] = item
            else:
                grouped_results[timestamp]['qna'] = item

        result = {
            'statusCode': 200,
            'body': json.dumps(list(grouped_results.values()), cls=DecimalEncoder)
        }
        print(f"Returning result: {json.dumps(result)}")
        return result

    except KeyError as e:
        print(f"KeyError: {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({'error': f"Missing required field: {str(e)}"})
        }
    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({'error': "Invalid JSON in request body"})
        }
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }