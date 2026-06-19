# KineticLens
The project aims to revolutionize fitness guidance by leveraging cutting-edge technologies such as computer vision and machine learning. Through an interactive web application built with **React** and **Vite**, users receive real-time posture correction feedback during workouts. The integration of **MediaPipe Pose** enables accurate client-side posture detection and correction directly in the browser, ensuring optimal exercise form. Additionally, the application utilizes an **LLM-powered** planner to provide personalized weekly exercise plans tailored to individual users' fitness goals and progress. With browser-based **LocalStorage** database adapter, the project ensures seamless data storage and retrieval locally, contributing to a private and personalized fitness experience.

## Objectives and Goals
- Detect and correct improper posture in real-time.
- Deliver personalized exercise plans tailored to individual users' needs and fitness goals.
- Integrate computer vision algorithms (OpenCV, MediaPipe) to analyze user movements and provide instant feedback.
- Utilize Large Language Models (LLM) to generate personalized weekly exercise plans based on users' fitness levels, preferences, and progress.

## Tools & Technologies
- **Frontend Stack**: React 19, Vite, Javascript (ES6+), HTML5, CSS3 (Pastel Palette System)
- **Machine Learning & Models**: MediaPipe Pose estimation (client-side via CDN), Web Speech API for voice alerts
- **Storage**: HTML5 LocalStorage for local-only account profile and session caching
- **Data Visualization**: ChartJS & React-Chartjs-2 for body progress metrics

## Methodology
Our AI-powered fitness application follows a structured approach to posture detection, personalized workout recommendations, and real-time feedback. The methodology consists of three core components:

### A. POSTURE CORRECTION FUNCTION
In this web application, we have integrated five primary exercises, namely Squats, Bicep Curl, Dumbbell Fly, Dumbbell kickback, and Push-ups, to cater to diverse fitness routines. Each 
exercise uses the same standardized logic, meticulously designed to ensure accuracy and
effectiveness. For an easier explanation of this approach, we will employ the Bicep Curl as a
paradigmatic example for elucidation within this report. 

#### 1. **Real-Time Posture Detection**
- MediaPipe Pose employs machine learning for precise body pose tracking in videos. It uses BlazePose, integrating COCO, BlazeFace, and BlazePalm functionalities, to detect 33 body landmarks in an RGB frame. The system follows a two-stage detection-tracking pipeline: first, it detects the region of interest (ROI) to locate the person, and then, it tracks and predicts pose landmarks within the ROI using a cropped frame.

#### 2. **Choosing Frontal and Side View for Posture Analysis**
Selecting the appropriate viewpoint for capturing a user’s movement is crucial for accurate fitness analysis.

- **Frontal View**: This view enables the system to analyze both the left and right sides of the body. It is useful for exercises where symmetry matters, such as overhead presses, side planks, crunches, and curls. In our web application, the frontal view is primarily used for dumbbell fly exercises.
- **Side View**: This perspective enhances estimation accuracy for inclinations relative to verticals or horizontals. It is beneficial for exercises like deadlifts, pushups, squats, and dips. 

Given our focus on Bicep Curl analysis, where precise vertical inclinations are necessary, we prioritize the **side view** for optimal accuracy.

#### 3. **Bicep Curl Form Analysis**
To evaluate bicep curl form, we analyze specific body landmarks:
- **Shoulder-elbow angle**
- **Elbow-wrist angle**
- **Shoulder-hip angle**

These angles are compared against predefined thresholds to determine if the bicep curl is executed correctly. Real-time feedback is generated based on this assessment.

Additionally, we compute the offset angle between the nose and shoulders to ensure the user maintains a proper side view for accurate pose estimation. If the offset angle exceeds a certain threshold, warnings are provided.

#### 4. **State Tracking for Bicep Curls**
We implement a state transition system to monitor bicep curl execution:
1. **State (s1) - Normal Phase:** The user stands straight with an elbow angle between 145° and 200°.
2. **State (s2) - Transition Phase:** The elbow angle decreases to between 85° and 144° as the curl progresses.
3. **State (s3) - Pass Phase:** The elbow reaches an angle between 35° and 84°, completing the curl.

A sequence list (`state_sequence`) tracks these transitions. A correct curl follows the sequence `[s1 → s2 → s3 → s2 → s1]`. Incorrect sequences trigger feedback.

We also incorporate an **inactivity timer** that resets the counters if no motion is detected beyond a predefined threshold.

#### 5. **Application Workflow** 
This application workflow follows a methodology inspired by the LearnOpenCV [website](learnopencv.com)

Detailed explaination can be found in report.


#### 6. **Feedback System**
- Provides **instant correction suggestions** based on detected posture deviations, highlighting areas that need adjustment.
- Uses **reinforcement learning techniques** to refine posture detection and feedback accuracy over time.
- Implements **audio-visual guidance** for users, enabling interactive engagement and self-improvement in workout form.

### B. PERSONALIZED EXERCISE PLANS GENERATOR

- A **machine learning-based recommendation system** tailors exercise plans to individual users based on fitness levels, goals, and posture performance.
- The system dynamically **adjusts difficulty and exercises** based on user progress and real-time posture feedback.
- Uses **Large Language Models (LLM)** to generate structured weekly fitness programs incorporating user preferences and past performance data.

### C. FRONT-END OF THE WEB APP
An interactive single-page dashboard featuring an exercise selector, live camera/video layout with skeleton feedback, real-time analytics graphs, recovery recommendations, and achievement milestones.


## Expected Outcomes
- Reduce injury risks caused by improper exercise posture.
- Improve workout efficiency with real-time AI feedback.
- Enable users to follow structured, personalized fitness plans.

## How to Use This Repository
1. **Clone the repository:**
   ```sh
   git clone <your-repository-url>
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Run the application (Development Server):**
   ```sh
   npm run dev
   ```
4. **Build the production bundle:**
   ```sh
   npm run build
   ```
4. **Follow the on-screen instructions to analyze your posture and get personalized workout recommendations.**

## Future Enhancements
- Implement AI-based voice coaching for real-time workout guidance.
- Expand the dataset to improve posture recognition accuracy.
- Develop a mobile app for easy accessibility.

---
### Author
Preetika Anjana




