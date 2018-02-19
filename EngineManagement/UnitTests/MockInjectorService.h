namespace EngineManagement
{
	class MockInjectorService : public IInjectorService
	{
	public:
		MOCK_METHOD0(InjectorOpen, void());
		MOCK_METHOD0(InjectorClose, void());
	};
}