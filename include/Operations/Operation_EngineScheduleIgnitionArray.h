#include "Operations/IOperation.h"
#include "Operations/Operation_EngineScheduleIgnition.h"

#ifndef OPERATION_ENGINESCHEDULEIGNITIONARRAY_H
#define OPERATION_ENGINESCHEDULEIGNITIONARRAY_H
namespace OperationArchitecture
{
	struct EngineScheduleIgnitionArray
	{
		public:
		void Initialize(uint8_t length)
		{
			Length = length;
			DwellTick = reinterpret_cast<uint32_t*>(malloc(sizeof(uint32_t) * Length));
			IgnitionTick = reinterpret_cast<uint32_t*>(malloc(sizeof(uint32_t) * Length));
		}

		uint8_t Length;
		uint32_t* DwellTick;
		uint32_t* IgnitionTick;
	};

	class Operation_EngineScheduleIgnitionArray : public IOperation<EngineScheduleIgnitionArray, EnginePosition, float, float>
	{
	protected:
		uint8_t _length;
		Operation_EngineScheduleIgnition **_array;
		EngineScheduleIgnitionArray _ret;
	public:		
        Operation_EngineScheduleIgnitionArray(EmbeddedIOServices::ITimerService *timerService, uint8_t length, const float* tdc, IOperation<void, bool> **ignitionOutputOperation);

		EngineScheduleIgnitionArray Execute(EnginePosition enginePosition, float ignitionDwell, float ignitionAdvance) override;

		static IOperationBase *Create(const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif