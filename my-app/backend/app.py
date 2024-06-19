from flask import Flask, request, jsonify
import os
import pickle
import numpy as np
import cv2
import face_recognition
import firebase_admin
from firebase_admin import credentials, db, storage
from datetime import datetime
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Firebase initialization
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': "https://face-recog-6f4f3-default-rtdb.firebaseio.com/",
    'storageBucket': "face-recog-6f4f3.appspot.com"
})
bucket = storage.bucket()

# Load the encoding file if it exists, else initialize empty lists
if os.path.exists('EncodeFile.p'):
    with open('EncodeFile.p', 'rb') as file:
        encodeListKnownWithIds = pickle.load(file)
    encodeListKnown, studentIds = encodeListKnownWithIds
else:
    encodeListKnown = []
    studentIds = []

@app.route('/recognize', methods=['POST'])
def recognize():
    data = request.get_json()
    image_data = base64.b64decode(data['image'])
    np_img = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    print("hey")

    imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)
    print("hi")
    faceCurFrame = face_recognition.face_locations(imgS)
    encodeCurFrame = face_recognition.face_encodings(imgS, faceCurFrame)

    if faceCurFrame:
        for encodeFace, faceLoc in zip(encodeCurFrame, faceCurFrame):
            matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
            faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
            print("jkhbmn")
            matchIndex = np.argmin(faceDis)
            print("bbbb")
            if matches[matchIndex]:
                id = studentIds[matchIndex]
                studentInfo = db.reference(f'Students/{id}').get()
                blob = bucket.get_blob(f'Images/{id}.jpg')
                array = np.frombuffer(blob.download_as_string(), np.uint8)
                imgStudent = cv2.imdecode(array, cv2.IMREAD_COLOR)
                _, buffer = cv2.imencode('.jpg', imgStudent)
                img_str = base64.b64encode(buffer).decode()

                datetimeObject = datetime.strptime(studentInfo['last_attendance_time'], "%Y-%m-%d %H:%M:%S")
                secondsElapsed = (datetime.now() - datetimeObject).total_seconds()
                if secondsElapsed > 120:  # 120 seconds = 2 minutes
                    ref = db.reference(f'Students/{id}')
                    studentInfo['total_attendance'] += 1
                    ref.child('total_attendance').set(studentInfo['total_attendance'])
                    ref.child('last_attendance_time').set(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

                    return jsonify({
                        'attendance_status': 'Attendance marked successfully',
                        'student_id': id,
                        'student_info': studentInfo,
                        'img_url': f'data:image/png;base64,{img_str}'
                    })
                else:
                    return jsonify({
                        'attendance_status': 'Try after some time',
                        'student_id': id,
                        'student_info': studentInfo,
                        'img_url': f'data:image/png;base64,{img_str}',
                        'timetotake': 120 - secondsElapsed
                    })

    return jsonify({'attendance_status': 'No face recognized'})

@app.route('/add_student', methods=['POST'])
def add_student():
    data = request.get_json()
    student_id = data['student_id']
    student_name = data['student_name']
    image_data = base64.b64decode(data['image'])
    np_img = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    # Check if image was successfully decoded
    if img is None:
        return jsonify({'message': 'Failed to decode image'}), 400
    
    blob1 = bucket.blob(f'Images/{student_id}.jpg')
    _, buffer = cv2.imencode('.jpg', img)
    blob1.upload_from_string(buffer.tobytes(), content_type='image/jpg')

    # Identify the face bounding box
    face_locations = face_recognition.face_locations(img)
    if face_locations:
        top, right, bottom, left = face_locations[0]
        face_img = img[top:bottom, left:right]
        print("before\n\n")
        
        # Resize the cropped face to 300x300
        print("middle\n\n")
        face_img_resized = cv2.resize(face_img, (600, 600))

        # Save the cropped and resized face image to Firebase Storage
        blob = bucket.blob(f'Images/{student_id}.png')
        _, buffer = cv2.imencode('.png', face_img_resized)
        blob.upload_from_string(buffer.tobytes(), content_type='image/png')
        print("after\n\n")
        # Update student details in Firebase database
        student_ref = db.reference(f'Students/{student_id}')
        student_ref.set({
            'name': student_name,
            'total_attendance': 0,
            'last_attendance_time': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        print("after after\n\n")

        # Regenerate encodings
        regenerate_encodings()

        return jsonify({'message': 'Student added successfully'})
    else:
        return jsonify({'message': 'No face detected in the image'}), 400

def regenerate_encodings():
    imgList = []
    studentIds = []
    blobs = bucket.list_blobs(prefix='Images/')

    for blob in blobs:
        if blob.name.endswith('.png'):
            studentId = os.path.basename(blob.name).split('.')[0]
            studentIds.append(studentId)
            array = np.frombuffer(blob.download_as_string(), np.uint8)
            img = cv2.imdecode(array, cv2.IMREAD_COLOR)
            imgList.append(img)
    print("gggg")
    encodeListKnown = findEncodings(imgList)
    encodeListKnownWithIds = [encodeListKnown, studentIds]

    with open("EncodeFile.p", 'wb') as file:
        pickle.dump(encodeListKnownWithIds, file)

def findEncodings(imagesList):
    encodeList = []
    for img in imagesList:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)[0]
        encodeList.append(encode)
    print("dddd")
    return encodeList

if __name__ == '__main__':
    app.run(debug=True)
