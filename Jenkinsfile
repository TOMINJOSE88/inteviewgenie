pipeline {
  agent any

  environment {
    MONGO_URI = credentials('MONGO_URI')
    OPENAI_API_KEY = credentials('OPENAI_API_KEY')
  }

  stages {

    stage('Checkout Code') {
      steps {
        echo '🔄 Checking out code from GitHub...'
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        echo '📦 Installing Node.js packages...'
        sh 'npm install'
      }
    }

    stage('Run Tests') {
  steps {
    echo '✅ Giving Jest binary execute permissions...'
    sh 'chmod +x node_modules/.bin/jest'

    echo '🧪 Running Jest tests using npm script...'
    sh 'npm run test --if-present'
  }
}


    stage('Build Docker Image') {
      steps {
        echo '🐳 Building Docker image...'
        sh 'docker build -t tominjose/interviewgenie .'
      }
    }

    stage('Deploy Container (Test)') {
  steps {
    echo '🚀 Deploying app in test container...'
    sh '''
      docker rm -f interviewgenie-test || true
      docker run -d --name interviewgenie-test \
        -p 3000:3000 \
        -e MONGO_URI=$MONGO_URI \
        -e OPENAI_API_KEY=$OPENAI_API_KEY \
        tominjose/interviewgenie
    '''
  }
}

  }
}
