---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name:
description:
---

# My Agent

D#   env.sh  GitHub Runner

## 
 env.sh     GitHub Runner          .             .

##    env.sh

### 1.     
        :
- LANG:  
- JAVA_HOME:   Java
- ANT_HOME:   Apache Ant
- M2_HOME:   Maven
- ANDROID_HOME:   Android SDK
- ANDROID_SDK_ROOT:  Android SDK
- GRADLE_HOME:   Gradle
- NVM_BIN:  NVM bin
- NVM_PATH:  NVM
- LD_LIBRARY_PATH:   
- PERL5LIB:   Perl

### 2.   .env
    .env     .       .

### 3.   
      :
-           .env
-      

### 4.    (PATH)
   PATH    .path  .

##    env.sh

### 1.     
```bash
cp env.sh /path/to/actions-runner/
```

### 2.     
```bash
cd /path/to/actions-runner
source ./env.sh
```

### 3.  config.sh
  env.sh   config.sh:
```bash
./config.sh --url https://github.com/zedanazad43/stp --token YOUR_TOKEN
```

##   

###  
- **LANG**:         
- **LD_LIBRARY_PATH**:        

###   
- **JAVA_HOME**:   Java   Java applications
- **M2_HOME**:  Maven    Java
- **GRADLE_HOME**:  Gradle    Android Java

###    
- **ANDROID_HOME**:  Android SDK    Android
- **ANDROID_SDK_ROOT**:  Android SDK     

##  

### 1.    
          .env:
```bash
export NEW_VAR=value
```

### 2.   
     env.sh     varCheckList:
```bash
varCheckList=(
    'LANG'
    'JAVA_HOME'
    # ...    
    'NEW_VAR'  #  
)
```

### 3.    
  env.sh       :
```bash
cat .env
```

##    .env  
```
LANG=en_US.UTF-8
JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
M2_HOME=/usr/share/maven
GRADLE_HOME=/opt/gradle
LD_LIBRARY_PATH=/usr/local/lib
```
escribe what your agent does here...
