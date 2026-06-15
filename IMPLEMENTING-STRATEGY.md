# Implementing Strategy

We are going to be implementing this on three steps:
1. Backend:
    - We will be implementing the backend using FastAPI and Python (we need python for the AR and fastapi is friendly for our needs). The backend needs to implement:
        - Auth system
        - Gallery system (storage and fetching)
        - Review system (storing reviews and fetching reviews)
        - Assistant

    It won't implement anything related to AR.

2. Mobile:
    - We will be implementing the mobile app using React Native. The mobile app needs to implement
        - Auth system 4 pages (login, register, forgot password, reset password)
        - Gallery system (fetching and displaying)
        - Review system (submitting reviews and fetching reviews needs auth)
        - Assistant (needs auth)
    
    It won't implement anything related to AR.
    Also it is important to understand that the app could be used without auth, but things like reviews assistant and uploading to gallery will require auth. So it is important to make the design of that app like that.

3. AR:
    - We will be implementing the AR. No idea how to do this one yet.