//สามาถดูวิธีทำจาก https://adamblog.co/line-notify-google-calendar/ ข่อมครับ

//config
//id calender
var googleCalendarId = "";
//line token
var accessToken = "";

//options
//ชื่อที่จะตั้งให้แปลว่ายกคลาส ไม่แจ้งเตือน
var notLearnName = "ยกคลาส"
//เวลาที่จะให้แจ้งเตือนล่วงหน้า ตั้งแต่ 1 วันขึ้นไป ([ชั่วโมง,นาที])
var morningNotify = [6,0]
//จำนวนวันที่ต้องการให้เช็คแจ้งเตือนล่วงหน้า หน่วยเป็นวัน
var timeTo = 7
//โชว์ข้อมูลผ่าน log (true,false)
var check = 1
//ตั้งเวลาให้ทำงานล่วงหน้า (จากการทดสอบใช้เวลาอย่างน้อย 50 วินาที) หน่วยเป็นนาที
var runBeforeTime = 1


/*บัคที่อาจจะเกิดขึ้น
1.ถ้าวันที่ 11 เวลาที่มากกว่าเวลาที่จะให้แจ้งเตือนล่วงหน้า(ex. ตั้งไว้ 6:00 แต่สร้างตอน 8:23) สร้าง event วันที่ 12 
  ให้แจ้งเตือนล่วงหน้า 1 วัน"จะไม่แจ้งเตือน"เพราะเลยเวลาที่จะแจ้งเตือนแล้ว

 */


function test(){
  sendMessage("hi")
}

function calculateTime(time,change){
  if (change >= 1440){
    let dayToNotify = change/1440
    return dayToNotify
  }
  change += runBeforeTime
  if (time[1] < change){
    if (time[0] == 0){
      time[1] = 23
    }else{
      time[0] -= 1
    }
    time[1] += 60
  }
  time[1] -= change
  return time
}
function Main() {
  var time = new Date();
  var totime = new Date();
  totime.setDate(totime.getDate()+timeTo);
  var calendar = CalendarApp.getCalendarById(googleCalendarId);
  var eventList = calendar.getEvents(time,totime)
  var h = time.getHours();
  var m = time.getMinutes();
  var year = time.getFullYear()
  var month = time.getMonth()
  var day = time.getDate()
  var message = ""
  for (var i = 0; i < eventList.length; i++){
    if (eventList[i].getTitle() == notLearnName){
      continue;
    }
    let eventTitle = "วิชาเรียน : " + eventList[i].getTitle()
    let eventDay = "วันที่เรียน : " + eventList[i].getStartTime().toDateString()
    let eventTime = "เวลาเรียน : " + eventList[i].getStartTime().toTimeString().slice(0,5);
    let eventDescription = "Note : " + eventList[i].getDescription();
    let notify = eventList[i].getPopupReminders()[0]

    message = "\n" + eventTitle + "\n" + eventDay + "\n" + eventTime + "\n" + eventDescription;
    if(check)Logger.log(message)
    if(notify){
      let a = parseFloat(eventList[i].getStartTime().toTimeString().slice(0,2))
      let b = parseFloat(eventList[i].getStartTime().toTimeString().slice(3,5))
      let time = [a,b]
      let timeNotify = calculateTime(time,notify);

      if(check){
        if (Array.isArray(timeNotify)){
          Logger.log(['notify at ',timeNotify])
        }else{
          let hm = calculateTime([morningNotify[0],morningNotify[1]],0)
          Logger.log(['notify at ',[hm[0],hm[1]]])
        }
      }
      let t = new Date(eventList[i].getStartTime())
      t.setDate(t.getDate()-timeNotify)
      if (!Array.isArray(timeNotify)){
        let hm = calculateTime([morningNotify[0],morningNotify[1]],0)
        if (day == t.getDate() && (h == hm[0] && m == hm[1])){
          sendMessage(message)
        }
      }else if (day == eventList[i].getStartTime().getDate() && h == timeNotify[0] && m == timeNotify[1]){
        sendMessage(message)
      }
    }else{
      if(check)Logger.log('No notify')
    }
  }
}

function sendMessage(message) {
  var lineNotifyEndPoint = "https://notify-api.line.me/api/notify";
  
  var formData = {
    "message": message,
  };
  
  var options = {
    "headers" : {"Authorization" : "Bearer " + accessToken},
    "method" : 'post',
    "payload" : formData
  };

  try {
    var response = UrlFetchApp.fetch(lineNotifyEndPoint, options);
  }
  catch (error) {
    Logger.log(error.name + "：" + error.message);
    return;
  }
    
  if (response.getResponseCode() !== 200) {
    Logger.log("Sending message failed.");
  } 
}
