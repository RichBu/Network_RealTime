

//for device logger

DROP DATABASE IF EXISTS lb4a4vdbieztvy2i;
CREATE DATABASE lb4a4vdbieztvy2i;
USE lb4a4vdbieztvy2i;


CREATE TABLE ip_log (
    log_id INT NOT NULL AUTO_INCREMENT,
    time_str VARCHAR(19),
    ip_addr VARCHAR(16),
    ip_query VARCHAR(16),
    as_field VARCHAR(40),
    country VARCHAR(15),
    countryCode VARCHAR(5),
    city VARCHAR(15),
    region VARCHAR(5),
    regionName VARCHAR(15),
    zip VARCHAR(5),
    timezone VARCHAR(20),
    action_done VARCHAR(20),
    PRIMARY KEY (log_id)
);


CREATE TABLE user_log (
    user_log_id INT NOT NULL AUTO_INCREMENT,
    time_str VARCHAR(19),
    ip_addr VARCHAR(16),
    action_done VARCHAR(20),
    action_string VARCHAR(80),
    PRIMARY KEY (user_log_id)
);


CREATE TABLE event_bytime (
    event_log_id INT NOT NULL AUTO_INCREMENT,
    start_time_str VARCHAR(20),
    end_time_str VARCHAR(20),
    event_duration VARCHAR(20),
    on_time_utc VARCHAR(15),
    off_time_utc VARCHAR(15),
    dur_time_utc VARCHAR(15),
    m1 VARCHAR(3),
    m2 VARCHAR(3),
    m3 VARCHAR(3),
    m4 VARCHAR(3),
    m5 VARCHAR(3),
    m6 VARCHAR(3),
    m7 VARCHAR(3),
    m8 VARCHAR(3),
    m9 VARCHAR(3),
    PRIMARY KEY (event_log_id)
);


CREATE TABLE event_bymach (
    event_log_id INT NOT NULL AUTO_INCREMENT,
    mach_num_str VARCHAR(3),
    mach_num VARCHAR(3),
    event_str VARCHAR(20),
    start_time_str VARCHAR(20),
    end_time_str VARCHAR(20),
    start_time_utc VARCHAR(15),
    end_time_utc VARCHAR(15),
    event_duration_utc VARCHAR(15),
    on_time_utc VARCHAR(15),
    off_time_utc VARCHAR(15),
    PRIMARY KEY (event_log_id)
);


CREATE TABLE files_log (
    files_log_id INT NOT NULL AUTO_INCREMENT,
    time_of_upload_str VARCHAR(20),  
    filename_str VARCHAR(75),
    PRIMARY KEY (files_log_id)
);

