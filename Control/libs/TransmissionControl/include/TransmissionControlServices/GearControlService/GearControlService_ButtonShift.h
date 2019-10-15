// #include "TransmissionControlServices/GearControlService/IGearControlService.h"
// #include "TransmissionControlServices/ShiftService/IShiftService.h"
// #include "IOServices/ButtonService/IButtonService.h"

// using namespace IOServices;

// #if !defined(GEARCONTROLSERVICE_BUTTONSHIFT_H)
// #define GEARCONTROLSERVICE_BUTTONSHIFT_H
// namespace TransmissionControlServices
// {
// 	class GearControlService_ButtonShift : public IGearControlService
// 	{
// 	protected:
// 		IShiftService *_shiftService;
// 		IButtonService *_shiftUp;
// 		IButtonService *_shiftDown;
// 		unsigned char _numberOfGears;
// 		unsigned char _currentGear = 1;
// 	public:
// 		GearControlService_ButtonShift(unsigned char numberOfGears, IShiftService *shiftService, IButtonService *shiftUp, IButtonService *shiftDown);
// 		void ShiftUp();
// 		void ShiftDown();
// 		static void ShiftUpCallBack(void *gearControlService_ButtonShift);
// 		static void ShiftDownCallBack(void *gearControlService_ButtonShift);
// 	};
// }
// #endif