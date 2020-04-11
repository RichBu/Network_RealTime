

USE h1fnnkvamtvh9i22;

DROP TABLE machine_data_stat;



USE h1fnnkvamtvh9i22;


INSERT INTO machine_data_stat (
    mach_num, mach_descrip, mach_location, image_to_use,
    random_wt_running, random_wt_fault_gen, random_wt_fault_dur,
    mach_stat_code, fault_time, fault_time_unix, fault_code, fault_descrip,
    initiated_by
    ) VALUES (
        "01",
        "Haas VMC #01",
        "Production",
        "Haas_01.jpg",
        "75",
        "20",
        "350",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );


INSERT INTO machine_data_stat (
    mach_num, mach_descrip, mach_location, image_to_use,
    random_wt_running, random_wt_fault_gen, random_wt_fault_dur,
    mach_stat_code, fault_time, fault_time_unix, fault_code, fault_descrip,
    initiated_by
    ) VALUES (
        "02",
        "Haas VMC #02",
        "Production",
        "Haas_01.jpg",
        "70",
        "20",
        "100",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );


INSERT INTO machine_data_stat (
    mach_num, mach_descrip, mach_location, image_to_use,
    random_wt_running, random_wt_fault_gen, random_wt_fault_dur,
    mach_stat_code, fault_time, fault_time_unix, fault_code, fault_descrip,
    initiated_by
    ) VALUES (
        "03",
        "Haas VMC #03",
        "Production",
        "Haas_01.jpg",
        "80",
        "15",
        "400",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );


INSERT INTO machine_data_stat (
    mach_num, mach_descrip, mach_location, image_to_use,
    random_wt_running, random_wt_fault_gen, random_wt_fault_dur,
    mach_stat_code, fault_time, fault_time_unix, fault_code, fault_descrip,
    initiated_by
    ) VALUES (
        "04",
        "Haas VMC #04",
        "Production",
        "Haas_01.jpg",
        "77",
        "17",
        "300",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );


INSERT INTO machine_data_stat (
    mach_num, mach_descrip, mach_location, image_to_use,
    random_wt_running, random_wt_fault_gen, random_wt_fault_dur,
    mach_stat_code, fault_time, fault_time_unix, fault_code, fault_descrip,
    initiated_by
    ) VALUES (
        "05",
        "Icon VMC #01",
        "Production",
        "Icon_01.jpg",
        "85",
        "10",
        "200",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );


INSERT INTO machine_data_stat (
    mach_num, mach_descrip, mach_location, image_to_use,
    random_wt_running, random_wt_fault_gen, random_wt_fault_dur,
    mach_stat_code, fault_time, fault_time_unix, fault_code, fault_descrip,
    initiated_by
    ) VALUES (
        "06",
        "Clausing Lathe #01",
        "Lathe Department",
        "Lathe_01.jpg",
        "60",
        "5",
        "250",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );


INSERT INTO machine_data_stat (
    mach_num, mach_descrip, mach_location, image_to_use,
    random_wt_running, random_wt_fault_gen, random_wt_fault_dur,
    mach_stat_code, fault_time, fault_time_unix, fault_code, fault_descrip,
    initiated_by
    ) VALUES (
        "07",
        "Clausing Lathe #02",
        "Lathe Department",
        "Lathe_01.jpg",
        "50",
        "4",
        "100",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );


INSERT INTO machine_data_stat (
    mach_num, mach_descrip, mach_location, image_to_use,
    random_wt_running, random_wt_fault_gen, random_wt_fault_dur,
    mach_stat_code, fault_time, fault_time_unix, fault_code, fault_descrip,
    initiated_by
    ) VALUES (
        "08",
        "Fryer CNC #01",
        "Toolroom",
        "Fryer_01.jpg",
        "30",
        "1",
        "400",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );


INSERT INTO machine_data_stat (
    mach_num, mach_descrip, mach_location, image_to_use,
    random_wt_running, random_wt_fault_gen, random_wt_fault_dur,
    mach_stat_code, fault_time, fault_time_unix, fault_code, fault_descrip,
    initiated_by
    ) VALUES (
        "09",
        "TableTop CNC #01",
        "Engineering",
        "TableTop_01.jpg",
        "20",
        "40",
        "150",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );


INSERT INTO machine_data_stat (
    mach_num, mach_descrip, mach_location, image_to_use,
    random_wt_running, random_wt_fault_gen, random_wt_fault_dur,
    mach_stat_code, fault_time, fault_time_unix, fault_code, fault_descrip,
    initiated_by
    ) VALUES (
        "10",
        "3D Printer #01",
        "Printer room",
        "3Dprinter_01.jpg",
        "40",
        "03",
        "50",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );



CREATE TABLE rt_data (
    mach_num VARCHAR(2),
    mach_stat_code VARCHAR(20),
    event_time VARCHAR(20),
    event_time_unix VARCHAR(15),
    fault_code INT,
    fault_descrip VARCHAR(20),
    PRIMARY KEY (mach_num)
);


INSERT INTO rt_data (
    mach_num, mach_stat_code, fault_code, fault_descrip
    ) VALUES (
        "10",
        "3D Printer #01",
        "Printer room",
        "3Dprinter_01.jpg",
        "40",
        "03",
        "50",
        "0",
        "2020-01-01 07:00:00",
        "0",
        "0",
        " ",
        "0"
    );
