#include "IOServices/ButtonService/ButtonService_Polling.h"

#ifdef BUTTONSERVICE_POLLING_H
namespace IOServices
{
	ButtonService_Polling::ButtonService_Polling(ITimerService *timerService, IBooleanInputService *booleanInputService)
	{
		_timerService = timerService;
		_booleanInputService = booleanInputService;
		_callBackGroup = new CallBackGroup();
	}

	void ButtonService_Polling::Tick()
	{		
		if(_lastPressed != 0 && _timerService->GetElapsedTime(_lastPressed) < (BUTTONDEBOUNCETIME * 0.001f))
			return;
		
		_lastPressed = 0;

		_booleanInputService->ReadValue();
		if(_pressed && _booleanInputService->Value)
			return;

		_pressed = false;

		if(!_booleanInputService->Value)
			return;
		
		_lastPressed = _timerService->GetTick();
		_callBackGroup->Execute();
	}
}
#endif
