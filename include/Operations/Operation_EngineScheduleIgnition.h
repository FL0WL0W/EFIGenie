#include "Operations/IOperation.h"
#include "Operations/Operation_EnginePositionPrediction.h"
#include <tuple>

#ifndef OPERATION_ENGINESCHEDULEIGNITION_H
#define OPERATION_ENGINESCHEDULEIGNITION_H
namespace OperationArchitecture
{
	class Operation_EngineScheduleIgnition : public IOperation<std::tuple<uint32_t, uint32_t>, EnginePosition, float, float>
	{
	protected:
		EmbeddedIOServices::ITimerService *_timerService;
		float _tdc;
		Operation_EnginePositionPrediction *_predictor;
		IOperation<void, bool> *_ignitionOutputOperation;
		EmbeddedIOServices::Task *_dwellTask;
		EmbeddedIOServices::Task *_igniteTask;
		uint32_t _dwellingAtTick = 0;
		float _ignitionAt;
	public:		
        Operation_EngineScheduleIgnition(EmbeddedIOServices::ITimerService *timerService, float tdc, IOperation<void, bool> *ignitionOutputOperation);

		std::tuple<uint32_t, uint32_t> Execute(EnginePosition enginePosition, float ignitionDwell, float ignitionAdvance) override;
		void Dwell();
		void Ignite();

		static IOperationBase *Create(const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif