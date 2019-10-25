#include "Variables/Variable_DigitalPinRecord.h"

#ifdef VARIABLE_DIGITALPINRECORD_H
namespace Variables
{
	Variable_DigitalPinRecord::Variable_DigitalPinRecord(Record *record, HardwareAbstraction::IDigitalService *digitalService, HardwareAbstraction::ITimerService *timerService, uint8_t length, uint16_t pin, bool inverted)
	{
		_digitalService = digitalService;
		_timerService = timerService;
		_pin = pin;
		_inverted = inverted;
		if(record != 0)
			_record = record;
		else
			_record = new Record();
		if(_record->Length != length)
		{
			_record->Initialize(length);
		}

		_digitalService->ScheduleRecurringInterrupt(_pin, new HardwareAbstraction::CallBack<Variable_DigitalPinRecord>(this, &Variable_DigitalPinRecord::InterruptCallBack));
	}

	void Variable_DigitalPinRecord::TranslateValue()
	{
	}

	void Variable_DigitalPinRecord::InterruptCallBack()
	{
		bool state = _digitalService->ReadPin(_pin);
		uint32_t tick = _timerService->GetTick();
		if(_inverted)
			state = !state;
		uint8_t last = _record->Last;
		//only record toggles
		if(state == _record->Frames[last].State && _record->Frames[last].Valid)
			return;
		last++;
		if(last >= _record->Length)
			last = 0;
		_record->Frames[last].State = state;
		_record->Frames[last].Tick = tick;
		_record->Frames[last].Valid = true;
		_record->Last = last;
	}

	IVariable *Variable_DigitalPinRecord::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		uint32_t variableId = Service::IService::CastAndOffset<uint16_t>(config, sizeOut);
		uint32_t length = Service::IService::CastAndOffset<uint8_t>(config, sizeOut);
		const uint16_t pin = IService::CastAndOffset<uint16_t>(config, sizeOut);
		const bool inverted = IService::CastAndOffset<bool>(config, sizeOut);
					
		Variable_DigitalPinRecord *variableService = new Variable_DigitalPinRecord(serviceLocator->LocateAndCast<Record>(BUILDER_VARIABLE, variableId), serviceLocator->LocateAndCast<HardwareAbstraction::IDigitalService>(DIGITAL_SERVICE_ID), serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID), length, pin, inverted);

		serviceLocator->Register(BUILDER_VARIABLE, variableId, &variableService->_record);

		return variableService;
	}
	ISERVICE_REGISTERFACTORY_CPP(Variable_DigitalPinRecord, 12)
}
#endif
