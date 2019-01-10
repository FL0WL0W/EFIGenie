#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IButtonService.h"
#include "IOServices/BooleanInputService/IBooleanInputService.h"

#define BUTTONDEBOUNCETIME 100

#if !defined(BUTTONSERVICE_POLLING_H) && defined(IBUTTONSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define BUTTONSERVICE_POLLING_H
namespace IOServices
{
	class ButtonService_Polling : public IButtonService
	{
	protected:
		IBooleanInputService *_booleanInputService;
		ITimerService *_timerService;
		unsigned int _lastPressed = 0;
		bool _pressed = false;
		CallBackGroup *callBackGroup;

	public:
		ButtonService_Polling(ITimerService *timerService, IBooleanInputService *booleanInputService);
		void Tick();
	};
}
#endif