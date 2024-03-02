// 替换为你的PushPlus token
const token = '1234567890';


const {exec} = require('child_process');
const {setInterval} = require('timers');
const axios = require('axios'); // 引入axios库进行网络请求

const checkSmsInterval = 15000; // 每15秒检查一次短信
let count; // 用于统计短信的条数

// 初始化定时器来定期检查短信
const smsChecker = setInterval(checkSms, checkSmsInterval);

//检查是否存在相同进程
exec('pgrep relay_sms', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error}`);
        return;
    }
    if (stdout) {
        console.error('进程已存在');
        // 清理定时器
        clearInterval(smsChecker);

    }
})


// 检查短信并发送通知
function checkSms() {
    exec('termux-sms-list', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }
        const smsData = JSON.parse(stdout);
        //判断是否存在短信
        if (smsData.length > 0) {
            //判断是否为首次执行
            if (count == null) {
                console.log('初始化成功')
                count = smsData.length;//初始化短信条数
                return;
            }
            //推送新短信
            for (; smsData.length > count; count++) {
                sendNotify(smsData[count].number, smsData[count].body, smsData[count].received);
            }
        } else {
            count = 0;
            console.log('没有短信数据');
        }
    });
}

// 发送通知函数
async function sendNotify(number, content, date) {
    const url = 'http://www.pushplus.plus/send';
    const title = '来自' + number + '的短信通知：'; // 替换为你想要的标题
    const data = {
        token,
        title,
        content
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200) {
            console.log(date, response.data.code, response.data.msg, response.data.data);
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
