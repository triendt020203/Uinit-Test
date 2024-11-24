import { LangInterface, LanguageKey } from "./GameLanuage";

export default class th_US implements LangInterface<LanguageKey> {
    readonly PAYMENT_SUCCESS = 'Congratulations! Your account have been deposited %s chip. Thank you and enjoy playing games!';
    readonly WATCH_VIDEO_SUCCESS = "ยินดีด้วย! คุณได้รับ %s ชิป";
    readonly INV_POPUP_DESC = "เชิญเพื่อนของคุณเข้าร่วม ปางกัง และ\nรับ 1,000,000 เหรียญสำหรับเพื่อนแต่ละคนที่เข้าร่วม";
    readonly YOU_GOT_CHIP = "ยินดีด้วย! คุณได้รับ %s ชิป";
    readonly MUSIC = "ดนตรี";
    readonly SOUND = "เสียง";
    readonly GIFT_CODE = "รหัสของขวัญ";
    readonly LANGUAGE = "ภาษา";
    readonly ON = "บน";
    readonly OFF = "ปิด";
    readonly ADS_LEFT = "จำนวน";
    readonly ADS_NOT_AVAILABLE = "โฆษณาของคุณยังไม่พร้อม";
    readonly DAILY_ADS_REACHED = "ถึงขีดจำกัดโฆษณารายวันแล้ว กลับมาอีกครั้งในภายหลัง!";
    readonly BET = "เดิมพัน";
    readonly BET2 = "เดิมพัน: ";
    readonly ENTER_ROOM_CODE = "ป้อนรหัสห้อง";
    readonly LOADING_LOBBY_DATA = "กำลังโหลดข้อมูล...";
    readonly YOU_NEED_AT_LEAST = "คุณต้องมีชิปอย่างน้อย %s เพื่อเล่นเกม";
    readonly TUT_STEP_1 = "+ หลังแคงแล้ว ท่านที่มีค่าแต้มน้อยที่สุดในวง ไพ่จะเป็นผู้ชนะค่ะ\n+ ไฟ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 มีค่าแต้มตามตัวเลขไพ่ ด\n+ ไพ่ J, Q. K มีค่า 10 แต้ม ตามรูป";
    readonly TUT_STEP_2 = "หากไพ่ 5 ใบแรกเป็นไพ่พิเศษ จะชนะ ทันทีค่ะ\nไพ่พิเศษตามรูปค่ะ\n<color=#bd5d07>ไฟสเตรทฟลัช > ไฟโฟร์การ์ด > ไฟฟูลเฮาส์ > ไฟสี\n                                                                > ไฟเรียง > ไพ่ตอง</color>";
    readonly TUT_STEP_3 = "ตอนแรกแจกไพ่คนละ 5 ใบ ค่าแต้ม  ของท่านเป็น\n31 แต้ม ไม่ควรแคงในตอน นี้ จั่ว ดีกว่า";
    readonly TUT_STEP_4 = "ท่านชั่วได้ไพ่ 4 เพื่อลดค่าแต้มน้อยลง ระบบจะเลือก\nไพ่ที่มีแต้มสูงสุด K ให้โดยอัตโนมัติค่ะ กด ทิ้ง เพื่อทิ้งไฟ K";
    readonly TUT_STEP_5 = "ผู้เล่นข้างบนทิ้งไฟ 10 พอดีท่านมีไฟ 10 ด้วย.\nท่านไม่จําเป็นต้องจ้วค่ะและสามารถไหลได้ค่ะ และท่านจ\nะได้รับชิปไหลด้วยค่ะ";
    readonly TUT_STEP_6 = "ตอนนี้ท่านเหลือไพ่ 4 ใบ ค่ารวมเป็น 15 แต้ม\nค่าแต้มยังสูงอยู่ค่ะ ควร จ่ว ไฟต่อค่ะ";
    readonly TUT_STEP_7 = "ชั่วได้ไพ่ 2 ท่านสามารถทิงคู่ 4 ได้ค่ะ (ถ้ามีไพ่ตัวเลขเหมือ\nนกัน สามารถทิง ออกที่เดียวกันได้ค่ะ)";
    readonly TUT_STEP_8 = "เรามีคะแนนรวม 8 แต้ม นั่นเป็นคะแนนที่ต่ำ. ฉันคิดว่าเราสา\nมารถชนะได้ คลิก \"แคง\" เพื่อแสดงไพ่และเปรียบเทียบคะแนน";
    readonly TUT_STEP_9 = "ขอยินดีที่เรียนหลักสูตรมือใหม่ไพ่แคงจบเรียบร้อยค่ะ\nไปเล่นกับผู้เล่นท่านอื่นเดียวนี้ได้ เลย ! ขอให้โชคดีค่ะ";
    readonly SEND_YOU_100K = "<color=#618cc0>ส่งชิป 100k ให้คุณ</c>";
    readonly MY_FRIENDS = "เพื่อนของฉัน";
    readonly GIFT = "ของขวัญ";
    readonly NO_GIFT_TODAY = "วันนี้ไม่มีของขวัญจากเพื่อนของคุณ";
    readonly ROOM_NUMBER = "หมายเลขห้อง: ";
    readonly CONNECTION_LOST = "คุณขาดการเชื่อมต่อกับเซิร์ฟเวอร์\nกรุณาเชื่อมต่อใหม่";
    readonly WAIT_TO_EXIT = "ลงทะเบียนออกจากห้องเรียบร้อย";
    readonly WAIT_TO_EXIT_CANCEL = "ยกเลิกการออกจากโตะ";
    readonly CHAT_GLOBAL = "ทั่วโลก";
    readonly WRITE_A_MESSAGE = "เขียนข้อความ";
    readonly CAN_NOT_CHANGE_TABLE = "ไม่สามารถเปลี่ยนโต๊ะขณะเล่นเกมได้";    
    readonly ROOM_WAS_NOT_FOUND = "ไม่พบห้อง";
    readonly ROOM_FULL = "ห้องเต็ม";    
    readonly UNLIMITED = "ไม่ จำกัด";
    
}