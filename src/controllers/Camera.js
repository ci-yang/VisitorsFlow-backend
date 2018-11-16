class Camera {
    constructor(ip, name, date) {
        this.ip = ip;
        this.name = name;
        this.data;
        this.peopleflowObject;
        this.inDict;
        this.outDict;
        this.stayDict;
        this.date = date
    }

    setData(data) {
        this.data = data;
    }

    generateEmptyDict() {
        let date = new Date(this.date);
        const timeDict = {};

        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        for (let i = 0; i < 24; i += 1) {
            timeDict[date.toLocaleString()] = 0;
            date.setHours(date.getHours() + 1);
        }

        return timeDict;
    }

    calculatePeopleFlow() {
        const data = this.data;
        let inDict = this.generateEmptyDict();
        let outDict = this.generateEmptyDict();
        let stayDict = this.generateEmptyDict();

        for (let i = 0; i < data.length; i += 1) {
            let time = new Date(data[i].time);
            time = new Date(time.toLocaleString());
            time.setMinutes(0);
            time.setSeconds(0);
            time = time.toLocaleString();

            if (data[i].state === 1) {  // out
                outDict[time] = data[i].peopleAmount;
            } else {
                inDict[time] = data[i].peopleAmount;
            }
        }
        this.inDict = inDict;
        this.outDict = outDict;

        Object.keys(stayDict).forEach((item) => {
            stayDict[item] = (inDict[item] - outDict[item]) > 0 ? (inDict[item] - outDict[item]) : 0;
        });

        this.stayDict = stayDict;
    }

    generateTableData() {
        let obj;
        let tableData = [];

        this.calculatePeopleFlow();

        Object.keys(this.stayDict).forEach((item) => {
            obj = {
                time: item,
                inCount: this.inDict[item],
                outCount: this.outDict[item],
                stayCount: this.stayDict[item]
            }

            tableData.push(obj);
        });

        this.peopleflowObject = tableData;
    }


}

module.exports = Camera;