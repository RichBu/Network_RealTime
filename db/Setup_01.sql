DROP DATABASE IF EXISTS h1fnnkvamtvh9i22;
CREATE DATABASE h1fnnkvamtvh9i22;
USE h1fnnkvamtvh9i22;


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


CREATE TABLE rt_data (
    mach_num INT,
    mach_descrip VARCHAR(20),
    mach_status INT,
    event_time VARCHAR(20),
    event_time_unix VARCHAR(15),
    fault_code INT,
    fault_descrip VARCHAR(20),
    initiated_by INT
);


CREATE TABLE fault_codes (
    fault_code INT,
    fault_descrip VARCHAR(20),
    status_change INT    
);


CREATE TABLE fault_log (
    fault_log_id INT NOT NULL AUTO_INCREMENT,
    fault_time VARCHAR(20),
    fault_time_unix VARCHAR(15),
    mach_num INT,
    status_before INT,
    status_after INT,
    fault_code INT,
    mach_stop INT,
    initiated_by INT,
    PRIMARY KEY (fault_log_id)
);


CREATE TABLE machine_data_stat (
    mach_num INT,
    mach_descrip VARCHAR(20),
    mach_location VARCHAR(20),
    image_to_use VARCHAR(128),
    random_wt_running FLOAT,
    random_wt_fault_gen FLOAT,
    random_wt_fault_dur FLOAT,
    mach_status INT,
    fault_time VARCHAR(20),
    fault_time_unix VARCHAR(15),
    fault_code INT,
    fault_descrip VARCHAR(20),
    initiated_by INT
);


CREATE TABLE phone_log (
    phone_log_id INT NOT NULL AUTO_INCREMENT,
    phone_log_time VARCHAR(20),
    phone_log_time_unix VARCHAR(15),
    ip_addr VARCHAR(16),
    phone_number VARCHAR(15),
    notify_on INT,
    PRIMARY KEY (phone_log_id)
);

