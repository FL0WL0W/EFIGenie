#include "IOServices/ButtonService/ButtonService_Polling.h"
#include "IOServices/ButtonService/IButtonService.h"

#ifdef IBUTTONSERVICE_H
namespace IOServices
{
	IButtonService::IButtonService()
	{
		_callBackGroup = new CallBackGroup();
	}
	
	void IButtonService::Add(ICallBack *callBack)
	{
		_callBackGroup->Add(callBack);
	}
	
	void IButtonService::Add(void(*callBackPointer)(void *), void *parameters)
	{
		_callBackGroup->Add(callBackPointer, parameters);
	}
	
	void IButtonService::Remove(ICallBack *callBack)
	{
		_callBackGroup->Remove(callBack);
	}
	
	void IButtonService::Clear()
	{
		_callBackGroup->Clear();
	}
	
	void IButtonService::TickCallBack(void *buttonService)
	{
		reinterpret_cast<IButtonService*>(buttonService)->Tick();
	}

	IButtonService* IButtonService::CreateButtonService(const HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int *sizeOut)
	{
		const unsigned char buttonServiceId = *reinterpret_cast<const unsigned char *>(config);
		config = reinterpret_cast<const unsigned char *>(config) + 1;
		*sizeOut = sizeof(unsigned char);
		
		IButtonService *buttonService = 0;

		switch (buttonServiceId)
		{
#ifdef BUTTONSERVICE_POLLING_H
		case 1:
			{
				unsigned int size;
				IBooleanInputService *booleanInputService = IBooleanInputService::CreateBooleanInputService(hardwareAbstractionCollection, config, &size);
				config = reinterpret_cast<const unsigned char *>(config) + size;
				*sizeOut += size;

				buttonService = new ButtonService_Polling(hardwareAbstractionCollection->TimerService, booleanInputService);
				break;
			}
#endif
		}
		
		return buttonService;
	}
	
}
#endif
