#include "Operations/Operation_DigitalPinRecord.h"

#ifdef OPERATION_DIGITALPINRECORD_H
namespace Operations
{
	Operation_DigitalPinRecord::Operation_DigitalPinRecord(HardwareAbstraction::IDigitalService *digitalService, HardwareAbstraction::ITimerService *timerService, uint16_t pin, bool inverted, uint8_t length)
	{
		_digitalService = digitalService;
		_timerService = timerService;
		_pin = pin;
		_inverted = inverted;
		_record.Initialize(length);

		_digitalService->ScheduleRecurringInterrupt(_pin, new HardwareAbstraction::CallBack<Operation_DigitalPinRecord>(this, &Operation_DigitalPinRecord::InterruptCallBack));
	}

	Record Operation_DigitalPinRecord::Execute()
	{
		const uint8_t last = _record.Last;
		if(!_record.Frames[last].Valid)
			return _record;

		const uint32_t tick = _timerService->GetTick();
		if(HardwareAbstraction::ITimerService::TickLessThanTick(tick, _record.Frames[last].Tick))
		{
			for(int i = 0; i < _record.Length; i++)
			{
				 _record.Frames[last].Valid = false;
			}
		}

		return _record;
	}

	void Operation_DigitalPinRecord::InterruptCallBack()
	{
		bool state = _digitalService->ReadPin(_pin);
		const uint32_t tick = _timerService->GetTick();
		if(_inverted)
			state = !state;
		uint8_t last = _record.Last;
		//only record toggles
		if(state == _record.Frames[last].State && _record.Frames[last].Valid)
			return;
		last++;
		if(last >= _record.Length)
			last = 0;
		_record.Frames[last].State = state;
		_record.Frames[last].Tick = tick;
		_record.Frames[last].Valid = true;
		_record.Last = last;
	}

	IOperationBase *Operation_DigitalPinRecord::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		const uint16_t pin = IService::CastAndOffset<uint16_t>(config, sizeOut);
		const bool inverted = IService::CastAndOffset<bool>(config, sizeOut);
		uint32_t length = Service::IService::CastAndOffset<uint8_t>(config, sizeOut);
					
		Operation_DigitalPinRecord *operation = new Operation_DigitalPinRecord(serviceLocator->LocateAndCast<HardwareAbstraction::IDigitalService>(DIGITAL_SERVICE_ID), serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID), pin, inverted, length);

		return operation;
	}
	IOPERATION_REGISTERFACTORY_CPP(Operation_DigitalPinRecord, 12)
}
#endif
