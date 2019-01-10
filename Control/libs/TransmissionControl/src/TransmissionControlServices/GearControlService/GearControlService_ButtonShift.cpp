#include "TransmissionControlServices/GearControlService/GearControlService_ButtonShift.h"

namespace TransmissionControlServices
{
	GearControlService_ButtonShift::GearControlService_ButtonShift(unsigned char numberOfGears, IShiftService *shiftService, IButtonService *shiftUp, IButtonService *shiftDown)
	{
		_numberOfGears = numberOfGears;
		_shiftService = shiftService;
		_shiftUp = shiftUp;
		_shiftDown = shiftDown;

		_shiftService->SetGear(_currentGear);
	}

	void GearControlService_ButtonShift::ShiftUp()
	{
		if(_currentGear >= _numberOfGears)
			return;
		
		_currentGear++;
		_shiftService->SetGear(_currentGear);
	}

	void GearControlService_ButtonShift::ShiftDown()
	{
		if(_currentGear == 1)
			return;
		
		_currentGear--;
		_shiftService->SetGear(_currentGear);
	}

	void GearControlService_ButtonShift::ShiftUpCallBack(void *gearControlService_ButtonShift)
	{
		((GearControlService_ButtonShift*)gearControlService_ButtonShift)->ShiftUp();
	}

	void GearControlService_ButtonShift::ShiftDownCallBack(void *gearControlService_ButtonShift)
	{
		((GearControlService_ButtonShift*)gearControlService_ButtonShift)->ShiftDown();
	}
}