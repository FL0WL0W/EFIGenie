#include "Operations/IOperation.h"
#include "Operations/Operation_EnginePositionPrediction.h"
#include "ICallBack.h"
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
		EmbeddedIOServices::ICallBack *_dwellCallBack;
		EmbeddedIOServices::ICallBack *_igniteCallBack;
		EmbeddedIOServices::Task *_dwellTask;
		EmbeddedIOServices::Task *_igniteTask;
		uint32_t _dwellingAtTick = 0;
		float _ignitionAt;
	public:		
        Operation_EngineScheduleIgnition(EmbeddedIOServices::ITimerService *timerService, Operation_EnginePositionPrediction *predictor, float tdc, EmbeddedIOServices::ICallBack *dwellCallBack, EmbeddedIOServices::ICallBack *igniteCallBack);

		std::tuple<uint32_t, uint32_t> Execute(EnginePosition enginePosition, float ignitionDwell, float ignitionAdvance) override;
		void Dwell();
		void Ignite();

		static IOperationBase *Create(const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif