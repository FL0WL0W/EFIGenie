#include "Variables/Variable_Operation.h"
#include "Operations/Operation_ReluctorUniversal2x.h"

#ifdef OPERATION_RELUCTORUNIVERSAL2X_H
namespace Operations
{
	Operation_ReluctorUniversal2x::Operation_ReluctorUniversal2x(HardwareAbstraction::ITimerService *timerService, float risingPostion, float fallingPosition)
	{
		_timerService = timerService;
		_risingPostion = risingPostion;
		_fallingPosition = fallingPosition;
	}

	ReluctorResult Operation_ReluctorUniversal2x::Execute(Variables::Record *record, ScalarVariable tickIn)
	{
		ReluctorResult ret;
		ret.CalculatedTick = tickIn.To<uint32_t>();
		ret.Synced = false;
		uint8_t last = record->Last;
		if(!record->Frames[last].Valid)
			return ret;;
		const uint8_t startingLast = last;
		while(ret.CalculatedTick - record->Frames[last].Tick > 0x80000000)
		{
			last = Variables::Record::Subtract(last, 1, record->Length);
			if(!record->Frames[last].Valid)
				return ret;
			if(startingLast == last)
				return ret;
		}

		uint8_t lastMinus1 =  Variables::Record::Subtract(last, 1, record->Length);
		uint8_t lastMinus2 =  Variables::Record::Subtract(last, 2, record->Length);
		uint8_t lastMinus4 =  Variables::Record::Subtract(last, 4, record->Length);

		if(!record->Frames[lastMinus2].Valid || !record->Frames[lastMinus4].Valid)
			return ret;

		//ensure stability
		const float delta1 = static_cast<float>(_timerService->GetTick() - record->Frames[last].Tick);
		const float delta2 = static_cast<float>(record->Frames[last].Tick - record->Frames[lastMinus2].Tick);
		if(delta1 * 0.5 > delta2)
			return ret;
		const float delta3 = static_cast<float>(record->Frames[lastMinus2].Tick - record->Frames[lastMinus4].Tick);
		const float similarity = delta2 / delta3;
		if(similarity < 0.5 || similarity > 2)
			return ret;

		float deltaPosition = 0;
		float basePosition = 0;
		if(record->Frames[last].State)
		{
			deltaPosition = _risingPostion - _fallingPosition;
			basePosition = _risingPostion;
		}
		else
		{
			deltaPosition = _fallingPosition - _risingPostion;
			basePosition = _fallingPosition;
		}

		while(deltaPosition < 0)
			deltaPosition += 360;
		//account for negative positions and weird positions > 360
		while(deltaPosition > 360)
			deltaPosition -= 360;

		ret.PositionDot = deltaPosition / (record->Frames[last].Tick - record->Frames[lastMinus1].Tick);
		ret.Position = basePosition + (ret.CalculatedTick - record->Frames[last].Tick) * ret.PositionDot;
		while(ret.Position > 360)
			ret.Position -= 360;
		ret.PositionDot *= _timerService->GetTicksPerSecond();
		ret.Synced = true;
		return ret;
	}

	Operations::IOperationBase *Operation_ReluctorUniversal2x::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		return new Operation_ReluctorUniversal2x(serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID), IService::CastAndOffset<float>(config, sizeOut), IService::CastAndOffset<float>(config, sizeOut));
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_ReluctorUniversal2x, 1002, ReluctorResult, Variables::Record*, ScalarVariable)
}
#endif