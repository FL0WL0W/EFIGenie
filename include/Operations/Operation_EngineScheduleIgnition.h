#include "Operations/IOperation.h"
#include "Operations/Operation_EnginePositionPrediction.h"
#include "Operations/OperationPackager.h"
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
		std::function<void()> _dwellCallBack;
		std::function<void()> _igniteCallBack;
		EmbeddedIOServices::Task *_dwellTask;
		EmbeddedIOServices::Task *_igniteTask;
		uint32_t _dwellingAtTick = 0;
		float _ignitionAt;
		float _ignitionDwell;
	public:		
        Operation_EngineScheduleIgnition(EmbeddedIOServices::ITimerService *timerService, Operation_EnginePositionPrediction *predictor, float tdc, std::function<void()> dwellCallBack, std::function<void()> igniteCallBack);

		std::tuple<uint32_t, uint32_t> Execute(EnginePosition enginePosition, float ignitionDwell, float ignitionAdvance) override;
		void Dwell();
		void Ignite();

		static IOperationBase *Create(const void *config, size_t &sizeOut, const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager);
	};
}
#endif