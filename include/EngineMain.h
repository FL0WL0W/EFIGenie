#include "EmbeddedIOServiceCollection.h"
#include "Operations/Operation_Package.h"

#ifndef ENGINEMAIN_H
#define ENGINEMAIN_H
namespace EFIGenie
{
	class EngineMain
	{
		protected:
		OperationArchitecture::AbstractOperation *_inputsExecute = 0;
		OperationArchitecture::AbstractOperation *_preSyncExecute = 0;
		OperationArchitecture::AbstractOperation *_syncCondition = 0;
		OperationArchitecture::AbstractOperation *_mainLoopExecute = 0;
		bool _syncedOnce = false;
		OperationArchitecture::OperationFactory *_operationFactory = 0;
		OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *_variableMap;

		public:
		EngineMain(const void *config, size_t &sizeOut, const EmbeddedIOOperations::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *variableMap);
		~EngineMain();

		void Setup();
		void Loop();
	};
}
#endif