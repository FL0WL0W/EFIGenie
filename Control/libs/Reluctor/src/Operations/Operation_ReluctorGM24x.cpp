#include "Variables/Variable_Operation.h"
#include "Operations/Operation_ReluctorGM24x.h"

#ifdef OPERATION_RELUCTORGM24X_H
namespace Operations
{
	Operation_ReluctorGM24x::Operation_ReluctorGM24x(HardwareAbstraction::ITimerService *timerService)
	{
		_timerService = timerService;
	}

	ReluctorResult Operation_ReluctorGM24x::Execute(Variables::Record *record, ScalarVariable tickIn)
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

		uint8_t lastMinus8 =  Variables::Record::Subtract(last, 8, record->Length);
		if(!record->Frames[lastMinus8].Valid)
			return ret;

		uint8_t lastMinus1 =  Variables::Record::Subtract(last, 1, record->Length);
		uint8_t lastMinus2 =  Variables::Record::Subtract(last, 2, record->Length);
		uint8_t lastMinus4 =  Variables::Record::Subtract(last, 4, record->Length);
		uint8_t lastMinus6 =  Variables::Record::Subtract(last, 6, record->Length);
		
		uint8_t lastDown = last;
		if(record->Frames[last].State)
			lastDown = lastMinus1;
		uint8_t lastDownMinus2 =  Variables::Record::Subtract(lastDown, 2, record->Length);
		uint8_t lastDownMinus4 =  Variables::Record::Subtract(lastDown, 4, record->Length);
		const float delta1 = static_cast<float>(_timerService->GetTick() - record->Frames[lastDown].Tick);
		const float delta2 = static_cast<float>(record->Frames[last].Tick - record->Frames[lastDownMinus2].Tick);
		if(delta1 * 0.5 > delta2)
			return ret;
		const float delta3 = static_cast<float>(record->Frames[lastDownMinus2].Tick - record->Frames[lastDownMinus4].Tick);
		const float similarity = delta2 / delta3;
		if(similarity < 0.5 || similarity > 2)
			return ret;

		uint16_t baseDegree = 0;
		uint16_t pulseDegree = 0;

		if(IsLongPulse(record, last))
		{
			if(IsLongPulse(record, lastMinus2))
			{
				if(IsLongPulse(record, lastMinus4))
				{
					if(IsLongPulse(record, lastMinus6))
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//long-long-long-long-long
							if(record->Frames[last].State)
								//102
								baseDegree = 102;
							else
								//90
								baseDegree = 90;
						}
						else
						{
							//long-long-long-long-short
							if(record->Frames[last].State)
								//78
								baseDegree = 78;
							else
								//75
								baseDegree = 75;
						}
					}
					else
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//long-long-long-short-long
							if(record->Frames[last].State)
								//162
								baseDegree = 162;
							else
								//150
								baseDegree = 150;
						}
						else
						{
							//long-long-long-short-short
							if(record->Frames[last].State)
								//63
								baseDegree = 63;
							else
								//60
								baseDegree = 60;
						}
					}
				}
				else
				{
					if(IsLongPulse(record, lastMinus6))
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//long-long-short-long-long
							if(record->Frames[last].State)
								//138
								baseDegree = 138;
							else
								//135
								baseDegree = 135;
						}
						else
						{
							//long-long-short-long-short
							//wtf?
							return ret;;
						}
					}
					else
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//long-long-short-short-long
							if(record->Frames[last].State)
								//222
								baseDegree = 222;
							else
								//210
								baseDegree = 210;
						}
						else
						{
							//long-long-short-short-short
							if(record->Frames[last].State)
								//48
								baseDegree = 48;
							else
								//45
								baseDegree = 45;
						}
					}
				}
			}
			else
			{
				if(IsLongPulse(record, lastMinus4))
				{
					if(IsLongPulse(record, lastMinus6))
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//long-short-long-long-long
							if(record->Frames[last].State)
								//123
								baseDegree = 123;
							else
								//120
								baseDegree = 120;
						}
						else
						{
							//long-short-long-long-short
							//wtf?
							return ret;;
						}
					}
					else
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//long-short-long-short-long
							//wtf?
							return ret;;
						}
						else
						{
							//long-short-long-short-short
							if(record->Frames[last].State)
								//312
								baseDegree = 312;
							else
								//300
								baseDegree = 300;
						}
					}
				}
				else
				{
					if(IsLongPulse(record, lastMinus6))
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//long-short-short-long-long
							if(record->Frames[last].State)
								//198
								baseDegree = 198;
							else
								//195
								baseDegree = 195;
						}
						else
						{
							//long-short-short-long-short
							//wtf?
							return ret;;
						}
					}
					else
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//long-short-short-short-long
							if(record->Frames[last].State)
								//282
								baseDegree = 282;
							else
								//270
								baseDegree = 270;
						}
						else
						{
							//long-short-short-short-short
							if(record->Frames[last].State)
								//33
								baseDegree = 33;
							else
								//30
								baseDegree = 30;
						}
					}
				}
			}
			pulseDegree = baseDegree % 15;
			if(pulseDegree == 0)
				pulseDegree = 12;
		}
		else
		{
			if(IsLongPulse(record, lastMinus2))
			{
				if(IsLongPulse(record, lastMinus4))
				{
					if(IsLongPulse(record, lastMinus6))
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//short-long-long-long-long
							if(record->Frames[last].State)
								//108
								baseDegree = 108;
							else
								//105
								baseDegree = 105;
						}
						else
						{
							//short-long-long-long-short
							if(record->Frames[last].State)
								//177
								baseDegree = 177;
							else
								//165
								baseDegree = 165;
						}
					}
					else
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//short-long-long-short-long
							//wtf?
							return ret;;
						}
						else
						{
							//short-long-long-short-short
							if(record->Frames[last].State)
								//237
								baseDegree = 237;
							else
								//225
								baseDegree = 225;
						}
					}
				}
				else
				{
					if(IsLongPulse(record, lastMinus6))
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//short-long-short-long-long
							//wtf?
							return ret;;
						}
						else
						{
							//short-long-short-long-short
							if(record->Frames[last].State)
								//327
								baseDegree = 327;
							else
								//315
								baseDegree = 315;
						}
					}
					else
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//short-long-short-short-long
							//wtf?
							return ret;;
						}
						else
						{
							//short-long-short-short-short
							if(record->Frames[last].State)
								//288
								baseDegree = 288;
							else
								//285
								baseDegree = 285;
						}
					}
				}
			}
			else
			{
				if(IsLongPulse(record, lastMinus4))
				{
					if(IsLongPulse(record, lastMinus6))
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//short-short-long-long-long
							if(record->Frames[last].State)
								//183
								baseDegree = 183;
							else
								//180
								baseDegree = 180;
						}
						else
						{
							//short-short-long-long-short
							if(record->Frames[last].State)
								//252
								baseDegree = 252;
							else
								//240
								baseDegree = 240;
						}
					}
					else
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//short-short-long-short-long
							if(record->Frames[last].State)
								//342
								baseDegree = 342;
							else
								//330
								baseDegree = 330;
						}
						else
						{
							//short-short-long-short-short
							//wtf?
							return ret;;
						}
					}
				}
				else
				{
					if(IsLongPulse(record, lastMinus6))
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//short-short-short-long-long
							if(record->Frames[last].State)
								//258
								baseDegree = 258;
							else
								//255
								baseDegree = 255;
						}
						else
						{
							//short-short-short-long-short
							if(record->Frames[last].State)
								//357
								baseDegree = 357;
							else
								//345
								baseDegree = 345;
						}
					}
					else
					{
						if(IsLongPulse(record, lastMinus8))
						{
							//short-short-short-short-long
							if(record->Frames[last].State)
								//12
								baseDegree = 12;
							else
								//0
								baseDegree = 0;
						}
						else
						{
							//short-short-short-short-short
							if(record->Frames[last].State)
								//18
								baseDegree = 18;
							else
								//15
								baseDegree = 15;
						}
					}
				}
			}
			pulseDegree = baseDegree % 15;
			if(pulseDegree == 0)
				pulseDegree = 3;
		}

		ret.PositionDot = static_cast<float>(pulseDegree) / (record->Frames[last].Tick - record->Frames[lastMinus1].Tick);
		ret.Position = baseDegree + (ret.CalculatedTick - record->Frames[last].Tick) * ret.PositionDot;
		while(ret.Position > 360)
			ret.Position -= 360;
		ret.PositionDot *= _timerService->GetTicksPerSecond();
		ret.Synced = true;
		return ret;
	}

	bool Operation_ReluctorGM24x::IsLongPulse(Variables::Record *record, uint8_t frame)
	{
		if(record->Frames[frame].State)
			frame = Variables::Record::Subtract(frame, 1, record->Length);

		uint8_t frameMinus1 = Variables::Record::Subtract(frame, 1, record->Length);
		uint8_t frameMinus2 = Variables::Record::Subtract(frame, 2, record->Length);

		uint32_t ticksPer15Degrees = record->Frames[frame].Tick - record->Frames[frameMinus2].Tick;
		uint32_t ticksPer7P5Degrees = ticksPer15Degrees / 2;

		return record->Frames[frame].Tick - record->Frames[frameMinus1].Tick > ticksPer7P5Degrees;
	}

	Operations::IOperationBase *Operation_ReluctorGM24x::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		return new Operation_ReluctorGM24x(serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID));
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_ReluctorGM24x, 1001, ReluctorResult, Variables::Record*, ScalarVariable)
}
#endif