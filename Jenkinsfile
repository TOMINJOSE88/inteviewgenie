pipeline {
  agent { label 'docker-agent' }

  tools {
    nodejs 'NodeJS_18'  
  }

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
        bat 'npm install'
      }
    }

    

    stage('Code Quality Analysis') {
  steps {
    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
      bat 'npx sonar-scanner'
    }
  }
}

stage('Security Scan') {
  steps {
    echo '🔐 Installing and running Snyk for vulnerability analysis...'
    sh 'npm install -g snyk'
    
    withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
      sh 'snyk auth $SNYK_TOKEN'
      // Fail build if High/Critical vulns found
      sh 'snyk test --severity-threshold=high'
    }
  }
}


    stage('Build Docker Image') {
      steps {
        echo '🐳 Building Docker image...'
        bat 'docker build -t tominjose/interviewgenie .'
      }
    }

   stage('Deploy Container (Test)') {
  steps {
    echo '🚀 Deploying app in test container...'
    bat '''
      docker rm -f interviewgenie-test || exit 0
      docker run -d --name interviewgenie-test ^
        -p 3000:3000 ^
        -e MONGO_URI="%MONGO_URI%" ^
        -e OPENAI_API_KEY="%OPENAI_API_KEY%" ^
        tominjose/interviewgenie
    '''
  }
}


  }

  post {
    always {
      echo '🧹 Pipeline completed.'
    }
    success {
      echo '✅ All steps succeeded!'
    }
    failure {
      echo '❌ Something went wrong.'
    }
  }
}
